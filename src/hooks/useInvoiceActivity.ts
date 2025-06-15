
import { useCallback, useEffect, useState } from "react";

export type ActivityEvent = {
  type: "created" | "edited" | "downloaded";
  timestamp: string;
  description: string;
};

const LOCAL_STORAGE_KEY = "invoiceease-activity-events";

export function useInvoiceActivity() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setEvents(JSON.parse(stored));
    }
  }, []);

  const addEvent = useCallback((type: ActivityEvent["type"], description: string) => {
    const newEvent: ActivityEvent = {
      type,
      timestamp: new Date().toISOString(),
      description,
    };
    const updatedEvents = [newEvent, ...events].slice(0, 50); // keep last 50 events
    setEvents(updatedEvents);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEvents));
  }, [events]);

  return { events, addEvent };
}
