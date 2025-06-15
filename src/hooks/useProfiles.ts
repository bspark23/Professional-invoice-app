import { useState, useEffect } from "react";

export type BusinessProfile = {
  id: string;
  name: string;
  logo?: string;
  email?: string;
  address?: string;
  // Add more profile-specific settings as needed
};

const PROFILES_KEY = "invoiceease-business-profiles";
const ACTIVE_PROFILE_KEY = "invoiceease-active-profile-id";

// Generic util
function generateProfileId() {
  return "profile-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  // Load profiles and active profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(PROFILES_KEY);
    setProfiles(saved ? JSON.parse(saved) : []);
    const active = localStorage.getItem(ACTIVE_PROFILE_KEY);
    setActiveProfileId(active || null);
  }, []);

  // Keep storage in sync
  useEffect(() => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (activeProfileId) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
    }
  }, [activeProfileId]);

  const createProfile = (profile: Omit<BusinessProfile, "id">) => {
    const newProfile: BusinessProfile = {
      ...profile,
      id: generateProfileId(),
    };
    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
    return newProfile;
  };

  const deleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (activeProfileId === id) {
      // Switch to another profile or null
      setActiveProfileId((prev) => {
        const others = profiles.filter((p) => p.id !== id);
        return others.length > 0 ? others[0].id : null;
      });
    }
  };

  const updateProfile = (id: string, data: Partial<BusinessProfile>) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const setActiveProfile = (id: string) => {
    setActiveProfileId(id);
  };

  const getActiveProfile = () => profiles.find(p => p.id === activeProfileId) || null;

  return {
    profiles,
    activeProfileId,
    activeProfile: getActiveProfile(),
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
  };
}
