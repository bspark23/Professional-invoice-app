
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Branding = {
  name: string;
  phone: string;
  email: string;
  address: string;
  logo: string; // Data URL string or empty
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

  // Image uploader/reader
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBranding(b => ({ ...b, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="mb-5 rounded-2xl shadow flex flex-col md:flex-row p-5 bg-white dark:bg-gray-900 gap-6 items-center">
      <div className="flex flex-col items-center justify-center gap-2 md:mr-6">
        <div className="relative h-20 w-20 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden">
          {branding.logo
            ? <img src={branding.logo} alt="Logo" className="object-cover h-full w-full"/>
            : <span className="text-2xl text-gray-400">Logo</span>}
        </div>
        <Button type="button" size="sm" variant="outline"
          onClick={() => fileInput.current?.click()}
        >{branding.logo ? "Change Logo" : "Add Logo"}</Button>
        <input
          type="file"
          accept="image/*"
          ref={fileInput}
          className="hidden"
          onChange={handleLogoChange}
        />
      </div>
      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
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
