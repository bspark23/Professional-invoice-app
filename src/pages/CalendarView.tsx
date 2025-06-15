
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { Calendar } from "@/components/ui/calendar";
import clsx from "clsx";

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

  // Generate a list of due dates for modifiers
  const datesWithInvoices = Object.keys(monthData).map(ds => new Date(ds));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center py-8">
      {/* Inline style for the colored dot */}
      <style>
        {`
          .invoice-dot {
            position: absolute;
            top: 3px;
            right: 3px;
            width: 0.45rem;
            height: 0.45rem;
            border-radius: 9999px;
            box-shadow: 0 0 3px #4447;
            z-index: 1;
          }
          .day-with-invoices {
            position: relative;
          }
        `}
      </style>
      <Card className="w-full max-w-3xl shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Invoice Calendar</CardTitle>
          <p className="text-gray-600 dark:text-gray-300">See when your invoices are due at a glance.</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-4">
          <Calendar
            mode="single"
            selected={undefined}
            modifiers={{
              withInvoices: datesWithInvoices
            }}
            showOutsideDays
            className="pointer-events-auto"
            // Highlight days with invoices by using modifiers and classNames
            classNames={{
              ...Calendar.defaultProps?.classNames,
              day: clsx(
                Calendar.defaultProps?.classNames?.day,
                "day-with-invoices relative"
              ),
              day_withInvoices: "day-with-invoices", // just for scoping
            }}
            components={{
              // To add a dot: Add a pseudo-element, or in day modifier, use content in classNames.
            }}
            onDayClick={() => { }}
            // As react-day-picker doesn't support direct children in day cell,
            // instead, we add an absolutely positioned dot here after the render.
          />
          {/* Decorate the dots inline */}
          <div style={{ display: "none" }} aria-hidden="true">
            {/*
              .invoice-dot logic is in <style> above
            */}
          </div>
          <script dangerouslySetInnerHTML={{
            __html: `
              setTimeout(() => {
                document.querySelectorAll('.day-with-invoices').forEach(day => {
                  if (day && !day.querySelector('.invoice-dot')) {
                    const dot = document.createElement('span');
                    dot.className = 'invoice-dot';
                    // Let unpaid = orange, else blue
                    const dstr = day?.getAttribute('aria-label')?.split('T')[0] || "";
                    const events = ${JSON.stringify(monthData)};
                    const dateKey = day?.getAttribute('aria-label')?.split('T')[0];
                    let c = '#22d3ee';
                    if(events[dateKey] && events[dateKey].some(e => !e.paid)) c = '#f59e42';
                    dot.style.background = c;
                    day.appendChild(dot);
                  }
                });
              }, 1);
            `
          }} />
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
