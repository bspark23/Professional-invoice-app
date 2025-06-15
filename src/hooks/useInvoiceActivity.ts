
import { useCallback, useEffect, useState } from "react";
import { useAuthLocal } from "@/hooks/useAuthLocal";

export type ActivityEvent = {
  type: "created" | "edited" | "downloaded";
  timestamp: string;
  description: string;
};

function getLocalStorageKey(userId: string | undefined | null) {
  // Use email or profileName for namespacing. If both exist, prefer email as it's unique.
  return userId
    ? `invoiceease-activity-events-${userId}`
    : "invoiceease-activity-events";
}

export function useInvoiceActivity() {
  // Get current user from auth hook
  const { user } = useAuthLocal();
  // Use email; fallback to profileName (should always have at least one)
  const userId = user?.email || user?.profileName;

  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    // Change key per user!
    const storageKey = getLocalStorageKey(userId);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setEvents(JSON.parse(stored));
    } else {
      setEvents([]); // clear events if switching user
    }
    // eslint-disable-next-line
  }, [userId]);

  const addEvent = useCallback(
    (type: ActivityEvent["type"], description: string) => {
      const newEvent: ActivityEvent = {
        type,
        timestamp: new Date().toISOString(),
        description,
      };
      const updatedEvents = [newEvent, ...events].slice(0, 50); // keep last 50 events
      setEvents(updatedEvents);
      const storageKey = getLocalStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(updatedEvents));
    },
    [events, userId]
  );

  return { events, addEvent };
}
