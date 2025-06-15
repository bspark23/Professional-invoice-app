
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, Smile } from "lucide-react";

type Branding = {
  name: string;
  phone: string;
  email: string;
  address: string;
  logo: string;
};

const BRANDING_KEY = "invoiceease-branding";

function getBrandingLocal(): Branding {
  try {
    const b = localStorage.getItem(BRANDING_KEY);
    if (!b) return { name: "", phone: "", email: "", address: "", logo: "" };
    return JSON.parse(b);
  } catch {
    return { name: "", phone: "", email: "", address: "", logo: "" };
  }
}

function saveBrandingLocal(branding: Branding) {
  localStorage.setItem(BRANDING_KEY, JSON.stringify(branding));
}

export interface BusinessBrandingCardProps {
  onBrandingChange?: (branding: Branding) => void;
}

const BusinessBrandingCard: React.FC<BusinessBrandingCardProps> = ({ onBrandingChange }) => {
  const [branding, setBranding] = useState<Branding>(getBrandingLocal());
  const fileInput = useRef<HTMLInputElement|null>(null);

  useEffect(() => {
    saveBrandingLocal(branding);
    if (onBrandingChange) onBrandingChange(branding);
    // eslint-disable-next-line
  }, [branding]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBranding(b => ({ ...b, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="mb-5 rounded-2xl shadow flex flex-col md:flex-row p-0 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Left: Logo Upload + Welcome, with gradient */}
      <div className="flex flex-col items-center justify-center md:justify-start gap-3 px-7 py-6 md:py-12 bg-gradient-to-br from-blue-200 via-blue-100 to-blue-50 w-full md:w-64">
        <div className="relative h-24 w-24 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center overflow-hidden shadow-lg">
          {branding.logo
            ? <img src={branding.logo} alt="Logo" className="object-cover h-full w-full"/>
            : (
              <ImagePlus className="text-blue-400" size={42} />
            )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="w-full mt-2"
          onClick={() => fileInput.current?.click()}
        >
          {branding.logo ? "Change Logo" : "Upload Logo"}
        </Button>
        <input
          type="file"
          accept="image/*"
          ref={fileInput}
          className="hidden"
          onChange={handleLogoChange}
        />
        <div className="mt-4 w-full">
          <div className="flex gap-1 items-center justify-center mb-1">
            <Smile className="inline-block text-yellow-400" size={18} />
            <span className="text-blue-700 font-bold text-base">Welcome!</span>
          </div>
          <div className="text-xs text-center text-blue-600">
            Personalize your business details for professional invoices.
          </div>
        </div>
      </div>
      {/* Right: Business details form */}
      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 md:p-8">
        <div>
          <label className="text-xs font-medium text-gray-500">Business Name</label>
          <Input
            value={branding.name}
            onChange={e => setBranding(b => ({ ...b, name: e.target.value }))}
            placeholder="e.g. Acme Corp"
            maxLength={48}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Phone</label>
          <Input
            value={branding.phone}
            onChange={e => setBranding(b => ({ ...b, phone: e.target.value }))}
            placeholder="+1 555 1234"
            maxLength={28}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Email</label>
          <Input
            value={branding.email}
            onChange={e => setBranding(b => ({ ...b, email: e.target.value }))}
            type="email"
            placeholder="info@acme.com"
            maxLength={40}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Address</label>
          <Input
            value={branding.address}
            onChange={e => setBranding(b => ({ ...b, address: e.target.value }))}
            placeholder="123 Main St, City"
            maxLength={78}
          />
        </div>
      </div>
    </div>
  );
};

export type { Branding };
export default BusinessBrandingCard;
