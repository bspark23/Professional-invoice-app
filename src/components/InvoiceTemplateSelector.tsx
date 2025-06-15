
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { colorThemes } from "@/types/invoice";

interface InvoiceTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: string;
  currentColorTheme: string;
  onTemplateSelect: (template: string, colorTheme: string) => void;
}

const templates = [
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean and simple design",
    preview: "Simple white background with clean typography and minimal styling"
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional business template",
    preview: "Dark header with yellow accents, structured layout for business use"
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with gradients",
    preview: "Modern layout with gradient elements and contemporary styling"
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional formal design",
    preview: "Traditional layout with formal typography and classic styling"
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated and refined",
    preview: "Elegant design with refined typography and sophisticated layout"
  }
];

const InvoiceTemplateSelector: React.FC<InvoiceTemplateSelectorProps> = ({
  isOpen,
  onClose,
  currentTemplate,
  currentColorTheme,
  onTemplateSelect
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate);
  const [selectedColorTheme, setSelectedColorTheme] = useState(currentColorTheme);

  const handleConfirm = () => {
    onTemplateSelect(selectedTemplate, selectedColorTheme);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Invoice Template</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Template Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{template.name}</h4>
                      {selectedTemplate === template.id && (
                        <Check className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="bg-gray-100 rounded p-3 text-xs text-gray-700">
                      {template.preview}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Color Theme Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Color Theme</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {colorThemes.map((theme) => (
                <Card
                  key={theme.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedColorTheme === theme.value ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedColorTheme(theme.value)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ 
                          background: theme.type === 'gradient' ? theme.gradient : theme.color 
                        }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{theme.name}</div>
                        {theme.type === 'gradient' && (
                          <Badge variant="secondary" className="text-xs">Gradient</Badge>
                        )}
                      </div>
                      {selectedColorTheme === theme.value && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Apply Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceTemplateSelector;
