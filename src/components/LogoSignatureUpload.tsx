
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

interface LogoSignatureUploadProps {
  businessLogo?: string;
  signatureImage?: string;
  onLogoChange: (dataUrl: string) => void;
  onSignatureChange: (dataUrl: string) => void;
  onLogoClear: () => void;
  onSignatureClear: () => void;
}

const LogoSignatureUpload: React.FC<LogoSignatureUploadProps> = ({
  businessLogo,
  signatureImage,
  onLogoChange,
  onSignatureChange,
  onLogoClear,
  onSignatureClear
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    file: File | null,
    onChange: (dataUrl: string) => void
  ) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo & Signature</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Logo */}
        <div>
          <Label htmlFor="businessLogo">Business Logo</Label>
          <div className="mt-2 space-y-3">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files?.[0] || null, onLogoChange)}
            />
            <Button
              variant="outline"
              onClick={() => logoInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Business Logo
            </Button>
            {businessLogo && (
              <div className="relative inline-block">
                <img 
                  src={businessLogo} 
                  alt="Business Logo" 
                  className="max-w-32 max-h-20 object-contain border rounded bg-white"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={onLogoClear}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Signature */}
        <div>
          <Label htmlFor="signature">Digital Signature</Label>
          <div className="mt-2 space-y-3">
            <input
              ref={signatureInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files?.[0] || null, onSignatureChange)}
            />
            <Button
              variant="outline"
              onClick={() => signatureInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Signature
            </Button>
            {signatureImage && (
              <div className="relative inline-block">
                <img 
                  src={signatureImage} 
                  alt="Signature" 
                  className="max-w-40 max-h-16 object-contain border rounded bg-white"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={onSignatureClear}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoSignatureUpload;
