
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { Calendar } from "@/components/ui/calendar";

type CalendarEvent = {
  id: string;
  name: string;
  dueDate: string;
  paid: boolean;
};

export default function CalendarView() {
  const { savedInvoices } = useInvoiceData();
  // Map invoice due dates to events
  const [monthData, setMonthData] = useState<{ [date: string]: CalendarEvent[] }>({});

  useEffect(() => {
    // Populate monthData: { 'YYYY-MM-DD': [events] }
    const map: { [date: string]: CalendarEvent[] } = {};
    savedInvoices.forEach(inv => {
      if (!inv.dueDate) return;
      if (!map[inv.dueDate]) map[inv.dueDate] = [];
      map[inv.dueDate].push({
        id: inv.id || '',
        name: inv.invoiceNumber,
        dueDate: inv.dueDate,
        paid: inv.status === "paid",
      });
    });
    setMonthData(map);
  }, [savedInvoices]);

  const modifiers = {
    withInvoices: (date: Date) => {
      const dstr = date.toISOString().split("T")[0];
      return !!monthData[dstr];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center py-8">
      <Card className="w-full max-w-3xl shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Invoice Calendar</CardTitle>
          <p className="text-gray-600 dark:text-gray-300">See when your invoices are due at a glance.</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-4">
          <Calendar
            mode="single"
            selected={undefined}
            modifiers={modifiers}
            showOutsideDays
            className="pointer-events-auto"
            onDayClick={() => {}}
            // Highlight days with invoices, assume blue dot for due days
            renderDay={(date) => {
              const dstr = date.toISOString().split("T")[0];
              const events = monthData[dstr];
              return (
                <div className="relative">
                  <span>{date.getDate()}</span>
                  {events && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{
                      background: events.some(e => !e.paid) ? '#f59e42' : '#22d3ee',
                      boxShadow: "0 0 3px #4447"
                    }} title={events.map(e=>e.name).join(", ")}></span>
                  )}
                </div>
              );
            }}
          />
          {/* List of invoices/due dates below calendar */}
          <div className="mt-6 w-full">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Due Invoices</h3>
            <ul>
              {Object.entries(monthData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, events]) =>
                  events.map(e => (
                    <li key={e.id} className="flex items-center gap-3 mb-1">
                      <span className={`px-2 rounded text-xs ${e.paid ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {e.paid ? 'Paid' : 'Due'}
                      </span>
                      <span className="font-bold">{e.name}</span>
                      <span className="text-gray-500">{date}</span>
                    </li>
                  ))
                )
              }
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
