
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "invoicer-pro-pin";

type Mode = "setup" | "confirm" | "entry";

interface PinLockProps {
  onUnlock: () => void;
}

const PinLock: React.FC<PinLockProps> = ({ onUnlock }) => {
  const [step, setStep] = useState<Mode>(() => {
    return localStorage.getItem(STORAGE_KEY) ? "entry" : "setup";
  });
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinEntry, setPinEntry] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Set up new PIN
  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    setStep("confirm");
    setPinConfirm("");
  };

  // Confirm PIN
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pin !== pinConfirm) {
      setError("PIN codes do not match.");
      return;
    }
    localStorage.setItem(STORAGE_KEY, pin);
    onUnlock();
  };

  // Entry PIN
  const handleEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const storedPin = localStorage.getItem(STORAGE_KEY);
    if (pinEntry === storedPin) {
      onUnlock();
    } else {
      setError("Incorrect PIN. Try again.");
      setPinEntry("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-sm w-full p-8 animate-fade-in">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-900">Invoicer Pro</h1>
        {step === "setup" && (
          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm">Set a new 4-digit PIN</label>
              <Input
                type="password"
                pattern="\d{4}"
                maxLength={4}
                inputMode="numeric"
                autoFocus
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                className="text-center text-lg tracking-widest"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full">Next</Button>
          </form>
        )}
        {step === "confirm" && (
          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm">Confirm your 4-digit PIN</label>
              <Input
                type="password"
                pattern="\d{4}"
                maxLength={4}
                inputMode="numeric"
                value={pinConfirm}
                onChange={e => setPinConfirm(e.target.value.replace(/\D/g, ""))}
                className="text-center text-lg tracking-widest"
                required
                autoFocus
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full">Save PIN</Button>
          </form>
        )}
        {step === "entry" && (
          <form onSubmit={handleEntry} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm">Enter your 4-digit PIN</label>
              <Input
                type="password"
                pattern="\d{4}"
                maxLength={4}
                inputMode="numeric"
                value={pinEntry}
                onChange={e => setPinEntry(e.target.value.replace(/\D/g, ""))}
                className="text-center text-lg tracking-widest"
                required
                autoFocus
                />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full">Unlock</Button>
          </form>
        )}
        <div className="text-xs text-center mt-5 text-gray-400">
          Your PIN is stored only on this device, never sent online.
        </div>
      </div>
    </div>
  );
};

export default PinLock;
