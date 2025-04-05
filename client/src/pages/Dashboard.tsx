import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const formatPLN = (amount: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const { data: salaries = [] } = useQuery({
    queryKey: ["salaries"],
    queryFn: () => fetch("/api/salaries").then((res) => res.json()),
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => fetch("/api/expenses").then((res) => res.json()),
  });

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const expenseMonth = expenseDate.getMonth();
    const expenseYear = expenseDate.getFullYear();

    return (selectedMonth === "all" || MONTHS[expenseMonth] === selectedMonth) &&
           (selectedYear === "all" || expenseYear.toString() === selectedYear);
  });

  const filteredSalaries = salaries.filter(salary => {
    return (selectedMonth === "all" || salary.month === selectedMonth) &&
           (selectedYear === "all" || salary.year.toString() === selectedYear);
  });

  const chartData = filteredExpenses.reduce((acc: any[], expense) => {
    const existingCategory = acc.find(item => item.category === expense.category);
    if (existingCategory) {
      existingCategory.amount += expense.amount;
    } else {
      acc.push({ category: expense.category, amount: expense.amount });
    }
    return acc;
  }, []);

  const totalIncome = filteredSalaries.reduce((sum, salary) => sum + salary.amount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const savings = totalIncome - totalExpenses;

  return (
    <Layout>
      <div className="max-w-5xl ml-0 pl-4">
        <h1 className="text-2xl font-semibold mb-6">Finance Dashboard</h1>

        <div className="flex gap-4 mb-6">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {MONTHS.map((month) => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {Array.from(new Set(expenses.map(e => new Date(e.date).getFullYear()))).map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Total Income</h3>
            <p className="text-2xl font-bold text-green-600">{formatPLN(totalIncome)}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600">{formatPLN(totalExpenses)}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Savings</h3>
            <p className={`text-2xl font-bold ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPLN(savings)}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Expenses by Category</h3>
          <div className="space-y-4">
            {chartData.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="font-medium">{item.category}</span>
                <span className="text-red-600">{formatPLN(item.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}