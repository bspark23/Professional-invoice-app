
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, Save, Key, Bot } from 'lucide-react';
import { useAuthLocal } from '@/hooks/useAuthLocal';

interface ApiKeyConfig {
  provider: 'openai' | 'gemini';
  openaiKey: string;
  geminiKey: string;
  prompt: string;
  model: string;
}

const ApiKeySettings: React.FC = () => {
  const { user } = useAuthLocal();
  const [config, setConfig] = useState<ApiKeyConfig>({
    provider: 'openai',
    openaiKey: '',
    geminiKey: '',
    prompt: `You are a smart invoice assistant named "InvoiceEase".

Your job is to take any user instruction in plain English and generate a structured invoice in JSON format. This invoice should contain all key financial and business details based on what the user said.

🎯 Your response must be ONLY in this exact JSON structure — no explanations, no extra text:

{
  "invoiceNumber": "INV-0001",
  "clientName": "",
  "clientEmail": "",
  "items": [
    {
      "name": "",
      "quantity": 0,
      "price": 0
    }
  ],
  "subtotal": 0,
  "tax": 0,
  "total": 0,
  "currency": "₦",
  "issueDate": "",
  "dueDate": "",
  "paymentTerms": "",
  "notes": ""
}

The user input will describe:
- Client name
- What the invoice is for
- Quantity and price
- Tax or VAT (if needed)
- Due date or payment terms

Fill out the JSON correctly, calculate totals, and include tax if mentioned.

✅ Examples of user input:
- Create an invoice for 5 hoodies at ₦10,000 each for Jerry's Fashion, due in 5 days.
- Make an invoice for 2 designs at ₦25,000 each for Ada Tech, add 7.5% VAT.
- Invoice for a website redesign ₦200,000 for Zina Studio, due in 7 days.

Always return clean, valid JSON that matches the user's request.`,
    model: 'gpt-3.5-turbo'
  });

  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved configuration on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(`apiConfig_${user?.email || 'default'}`);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (error) {
        console.error('Error loading API config:', error);
      }
    }
  }, [user?.email]);

  const handleInputChange = (field: keyof ApiKeyConfig, value: string) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };
      
      // Auto-update model when provider changes
      if (field === 'provider') {
        if (value === 'openai') {
          newConfig.model = 'gpt-3.5-turbo';
        } else if (value === 'gemini') {
          newConfig.model = 'gemini-1.5-flash';
        }
      }
      
      return newConfig;
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    
    try {
      localStorage.setItem(`apiConfig_${user?.email || 'default'}`, JSON.stringify(config));
      alert('API settings saved successfully!');
    } catch (error) {
      console.error('Error saving API config:', error);
      alert('Failed to save API settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getModelOptions = () => {
    if (config.provider === 'openai') {
      return [
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Recommended)' },
        { value: 'gpt-4', label: 'GPT-4' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }
      ];
    } else {
      return [
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Recommended)' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
        { value: 'gemini-pro', label: 'Gemini Pro' }
      ];
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Invoice Assistant Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <select
              id="provider"
              value={config.provider}
              onChange={(e) => handleInputChange('provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          {/* OpenAI API Key */}
          {config.provider === 'openai' && (
            <div className="space-y-2">
              <Label htmlFor="openaiKey" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                OpenAI API Key
              </Label>
              <div className="relative">
                <Input
                  id="openaiKey"
                  type={showOpenAIKey ? 'text' : 'password'}
                  value={config.openaiKey}
                  onChange={(e) => handleInputChange('openaiKey', e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                >
                  {showOpenAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Get your API key from{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>
          )}

          {/* Gemini API Key */}
          {config.provider === 'gemini' && (
            <div className="space-y-2">
              <Label htmlFor="geminiKey" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Google Gemini API Key
              </Label>
              <div className="relative">
                <Input
                  id="geminiKey"
                  type={showGeminiKey ? 'text' : 'password'}
                  value={config.geminiKey}
                  onChange={(e) => handleInputChange('geminiKey', e.target.value)}
                  placeholder="AIza..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Get your API key from{' '}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Google AI Studio
                </a>
                {config.provider === 'gemini' && (
                  <span className="block mt-1 text-orange-600 font-medium">
                    ⚠️ Make sure to enable the Generative Language API in your Google Cloud Console first!
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <select
              id="model"
              value={config.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getModelOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">System Prompt</Label>
            <Textarea
              id="prompt"
              value={config.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              rows={15}
              className="font-mono text-sm"
              placeholder="Enter your custom system prompt for the AI assistant..."
            />
            <p className="text-sm text-gray-600">
              Customize how the AI assistant processes invoice creation requests. The prompt above is optimized for generating structured invoice data.
            </p>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save API Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use AI Invoice Assistant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose text-sm">
            <p>
              Once you've configured your {config.provider === 'openai' ? 'OpenAI' : 'Google Gemini'} API key, you can use natural language to create invoices:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>"Create an invoice for 5 hoodies at ₦10,000 each for Jerry's Fashion, due in 5 days"</li>
              <li>"Make an invoice for 2 designs at ₦25,000 each for Ada Tech, add 7.5% VAT"</li>
              <li>"Invoice for website redesign ₦200,000 for Zina Studio, due in 7 days"</li>
            </ul>
            <p className="mt-4">
              The AI will automatically generate structured invoice data that you can then customize and save.
            </p>
            {config.provider === 'gemini' && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 font-medium">Important for Google Gemini users:</p>
                <p className="text-orange-700 text-sm mt-1">
                  You must enable the Generative Language API in your Google Cloud Console before using the API key. 
                  Visit the <a 
                    href="https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=164994802997" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    API Console
                  </a> to enable it, then wait a few minutes before trying again.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeySettings;
