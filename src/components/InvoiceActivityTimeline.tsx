
import { ActivityEvent } from "@/hooks/useInvoiceActivity";
import { Clock, Activity } from "lucide-react";

interface Props {
  events: ActivityEvent[];
}

const typeLabel: Record<ActivityEvent["type"], string> = {
  created: "Invoice created",
  edited: "Invoice edited",
  downloaded: "Invoice downloaded",
};

const typeColor: Record<ActivityEvent["type"], string> = {
  created: "text-blue-600",
  edited: "text-orange-600",
  downloaded: "text-green-600",
};

const iconByType: Record<ActivityEvent["type"], React.ReactNode> = {
  created: <Activity className="w-5 h-5 text-blue-600" />,
  edited: <Activity className="w-5 h-5 text-orange-600" />,
  downloaded: <Activity className="w-5 h-5 text-green-600" />,
};

function formatTimestamp(ts: string) {
  const dt = new Date(ts);
  return dt.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function InvoiceActivityTimeline({ events }: Props) {
  if (!events.length) {
    return (
      <div className="text-gray-400 flex items-center gap-2 text-sm pl-2 pb-2">
        <Clock className="w-4 h-4" /> No invoice activity yet.
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-4 mt-2 shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
        <Activity className="w-5 h-5" /> Invoice Activity Timeline
      </h2>
      <ol className="space-y-3">
        {events.map((ev, idx) => (
          <li key={idx} className="flex gap-3 items-center">
            <span>{iconByType[ev.type]}</span>
            <div>
              <div className={`font-medium ${typeColor[ev.type]}`}>{typeLabel[ev.type]}</div>
              <div className="text-xs text-gray-500">{formatTimestamp(ev.timestamp)}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{ev.description}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
