
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, Loader2, AlertCircle } from 'lucide-react';
import { useInvoiceData } from '@/hooks/useInvoiceData';
import { useAuthLocal } from '@/hooks/useAuthLocal';
import { InvoiceData } from '@/types/invoice';
import { toast } from '@/hooks/use-toast';

interface AIInvoiceAssistantProps {
  onInvoiceGenerated?: (invoice: InvoiceData) => void;
}

const AIInvoiceAssistant: React.FC<AIInvoiceAssistantProps> = ({ onInvoiceGenerated }) => {
  const { user } = useAuthLocal();
  const { generateInvoiceNumber } = useInvoiceData(null, user?.email || user?.profileName);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedInvoice, setLastGeneratedInvoice] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getApiConfig = () => {
    const savedConfig = localStorage.getItem(`apiConfig_${user?.email || 'default'}`);
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (error) {
        console.error('Error loading API config:', error);
      }
    }
    return null;
  };

  const cleanJsonResponse = (response: string): string => {
    // Remove markdown code blocks if present
    let cleanedResponse = response.trim();
    
    // Remove ```json and ``` markers
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '');
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '');
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/\s*```$/, '');
    }
    
    return cleanedResponse.trim();
  };

  const generateWithOpenAI = async (apiConfig: any, userInput: string) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiConfig.openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: apiConfig.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: apiConfig.prompt
          },
          {
            role: 'user',
            content: userInput
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      let errorMessage = `OpenAI API request failed (${response.status})`;
      
      if (errorData.error) {
        if (errorData.error.code === 'insufficient_quota') {
          errorMessage = 'Your OpenAI API key has exceeded its quota. Please check your billing in your OpenAI account.';
        } else if (errorData.error.code === 'invalid_api_key') {
          errorMessage = 'Invalid OpenAI API key. Please check your API key in Settings.';
        } else {
          errorMessage = errorData.error.message || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  };

  const generateWithGemini = async (apiConfig: any, userInput: string) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${apiConfig.model || 'gemini-1.5-flash'}:generateContent?key=${apiConfig.geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${apiConfig.prompt}\n\nUser request: ${userInput}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      let errorMessage = `Gemini API request failed (${response.status})`;
      
      if (errorData.error) {
        if (errorData.error.code === 'API_KEY_INVALID') {
          errorMessage = 'Invalid Gemini API key. Please check your API key in Settings.';
        } else if (errorData.error.code === 'QUOTA_EXCEEDED') {
          errorMessage = 'Your Gemini API quota has been exceeded. Please check your Google Cloud billing.';
        } else if (errorData.error.message && errorData.error.message.includes('Generative Language API has not been used')) {
          errorMessage = 'The Generative Language API is not enabled in your Google Cloud Console. Please enable it and wait a few minutes before trying again.';
        } else {
          errorMessage = errorData.error.message || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  };

  const generateInvoice = async () => {
    if (!userInput.trim()) return;
    
    const apiConfig = getApiConfig();
    if (!apiConfig) {
      setError('Please configure your AI settings first.');
      toast({
        title: "API Configuration Required",
        description: "Please configure your AI settings in Settings first.",
        variant: "destructive",
      });
      return;
    }

    const requiredKey = apiConfig.provider === 'openai' ? apiConfig.openaiKey : apiConfig.geminiKey;
    if (!requiredKey) {
      const providerName = apiConfig.provider === 'openai' ? 'OpenAI' : 'Google Gemini';
      setError(`Please configure your ${providerName} API key in Settings > AI Assistant first.`);
      toast({
        title: "API Key Required",
        description: `Please configure your ${providerName} API key in Settings first.`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let invoiceJson: string;
      
      if (apiConfig.provider === 'openai') {
        invoiceJson = await generateWithOpenAI(apiConfig, userInput);
      } else {
        invoiceJson = await generateWithGemini(apiConfig, userInput);
      }
      
      console.log('Raw AI response:', invoiceJson);
      
      // Clean the JSON response to remove markdown formatting
      const cleanedJson = cleanJsonResponse(invoiceJson);
      console.log('Cleaned JSON:', cleanedJson);
      
      // Parse the JSON response
      const parsedInvoice = JSON.parse(cleanedJson);
      
      // Convert to our InvoiceData format
      const invoiceData: InvoiceData = {
        id: Date.now().toString(),
        invoiceNumber: parsedInvoice.invoiceNumber || generateInvoiceNumber(),
        businessName: user?.profileName || user?.email || 'Your Business',
        businessEmail: user?.email || 'business@example.com',
        businessAddress: 'Your Business Address',
        clientName: parsedInvoice.clientName || '',
        clientEmail: parsedInvoice.clientEmail || '',
        clientAddress: '',
        invoiceDate: parsedInvoice.issueDate || new Date().toISOString().split('T')[0],
        dueDate: parsedInvoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lineItems: parsedInvoice.items?.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          description: item.name || '',
          quantity: item.quantity || 1,
          rate: item.price || 0,
          amount: (item.quantity || 1) * (item.price || 0),
        })) || [],
        currency: parsedInvoice.currency === '₦' ? 'NGN' : 'USD',
        taxRate: parsedInvoice.tax && parsedInvoice.subtotal ? (parsedInvoice.tax / parsedInvoice.subtotal) * 100 : 0,
        discountAmount: 0,
        status: 'unpaid',
        notes: parsedInvoice.notes || parsedInvoice.paymentTerms || '',
        template: 'minimalist',
        colorTheme: 'blue',
      };

      setLastGeneratedInvoice(invoiceData);
      onInvoiceGenerated?.(invoiceData);
      setUserInput('');
      setError(null);
      
      toast({
        title: "Invoice Generated!",
        description: `Invoice #${invoiceData.invoiceNumber} for ${invoiceData.clientName} has been created.`,
      });
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice. Please check your API key and try again.';
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const apiConfig = getApiConfig();
  const providerName = apiConfig?.provider === 'gemini' ? 'Google Gemini' : 'OpenAI';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Invoice Assistant {apiConfig?.provider && `(${providerName})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div>
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Describe your invoice in plain English...

Examples:
• Create an invoice for 5 hoodies at ₦10,000 each for Jerry's Fashion, due in 5 days
• Make an invoice for 2 designs at ₦25,000 each for Ada Tech, add 7.5% VAT
• Invoice for website redesign ₦200,000 for Zina Studio, due in 7 days"
            rows={6}
            className="resize-none"
          />
        </div>
        
        <Button 
          onClick={generateInvoice} 
          disabled={isGenerating || !userInput.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Invoice...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Generate Invoice
            </>
          )}
        </Button>

        {lastGeneratedInvoice && !error && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              ✅ Invoice generated successfully!
            </p>
            <p className="text-sm text-green-600 mt-1">
              Invoice #{lastGeneratedInvoice.invoiceNumber} for {lastGeneratedInvoice.clientName}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInvoiceAssistant;
