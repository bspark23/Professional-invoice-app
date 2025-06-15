
// Repair persistent loading, ensure correct income from savedInvoices, and render properly
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { formatCurrency } from "@/utils/invoiceUtils";

type Expense = {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
};

const categories = [
  "Rent", "Salary", "Tools", "Utilities", "Marketing", "Travel", "Supplies", "Other"
];

const LOCAL_STORAGE_KEY = "invoicecraft-expenses-v1";

export default function ExpenseTracker() {
  const { savedInvoices } = useInvoiceData();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({ name: "", amount: "", date: "", category: "" });
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    // Load expenses
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch {
        setExpenses([]);
      }
    }
    // Get currency from invoices if any
    if (savedInvoices.length > 0) {
      setCurrency(savedInvoices[0].currency || "USD");
    }
  }, [savedInvoices.length]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );
  const invoiceIncome = useMemo(
    () =>
      savedInvoices.reduce((sum, inv) => sum +
        (inv.lineItems.reduce((n, item) => n + item.amount, 0) +
        (inv.lineItems.reduce((n, item) => n + item.amount, 0) * inv.taxRate / 100) -
        inv.discountAmount), 0),
    [savedInvoices]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleAddExpense = () => {
    if (!form.name || !form.amount || !form.date || !form.category) {
      setError("All fields required");
      return;
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Invalid amount");
      return;
    }
    setExpenses([
      ...expenses,
      {
        id: Date.now().toString(),
        name: form.name,
        amount,
        date: form.date,
        category: form.category
      }
    ]);
    setForm({ name: "", amount: "", date: "", category: "" });
    setError(null);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50/50 to-purple-50/50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center py-8">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Expense Tracker</CardTitle>
          <p className="text-gray-600 dark:text-gray-300">Track business expenses & compare with invoice income</p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-4 mb-4" onSubmit={e => { e.preventDefault(); handleAddExpense(); }}>
            <div className="flex-1 min-w-[140px]">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={form.name} onChange={handleInput} placeholder="Expense name" autoComplete="off"/>
            </div>
            <div className="w-32">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" value={form.amount} onChange={handleInput} type="number" placeholder="0" min="0"/>
            </div>
            <div className="w-40">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" value={form.date} onChange={handleInput} type="date"/>
            </div>
            <div className="w-40">
              <Label htmlFor="category">Category</Label>
              <select id="category" name="category" value={form.category} onChange={handleInput} className="rounded border px-3 py-2 w-full bg-gray-50 dark:bg-gray-700">
                <option value="">--Select--</option>
                {categories.map(cat => <option key={cat}>{cat}</option>)}
              </select>
            </div>
            <Button type="submit" className="self-end bg-blue-600 text-white">Add</Button>
          </form>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <Separator className="my-4"/>
          <div>
            <h3 className="font-semibold mb-2">Expenses</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {expenses.length === 0 && <p className="text-gray-500">No expenses recorded.</p>}
              {expenses.map(e => (
                <div key={e.id} className="flex items-center justify-between p-1 rounded bg-gray-50 dark:bg-gray-700 group">
                  <span>{e.name} <span className="text-xs text-gray-400 ml-2">({e.category})</span></span>
                  <span>{formatCurrency(e.amount, currency)}</span>
                  <span className="text-xs text-gray-400">{e.date}</span>
                  <button
                    className="ml-2 text-xs text-red-500 opacity-0 group-hover:opacity-100 underline"
                    title="Delete"
                    type="button"
                    onClick={() => handleDeleteExpense(e.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>Total Expenses</span>
              <span>{formatCurrency(totalExpenses, currency)}</span>
            </div>
          </div>
          <Separator className="my-4"/>
          <div className="flex justify-between items-center font-medium">
            <span>Invoice Income</span>
            <span>{formatCurrency(invoiceIncome, currency)}</span>
          </div>
          <div className="flex justify-between items-center font-bold mt-2">
            <span>Net Profit (Income - Expenses)</span>
            <span className={invoiceIncome - totalExpenses >= 0 ? "text-green-600" : "text-red-600"}>
              {formatCurrency(invoiceIncome - totalExpenses, currency)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
