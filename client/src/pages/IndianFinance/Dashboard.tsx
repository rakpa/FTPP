import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Layout } from "@/components/Layout";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function IndianDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const { data: salaries = [] } = useQuery<any[]>({
    queryKey: ["indian-salaries"],
    queryFn: () => fetch("/api/indian-salaries").then((res) => res.json()),
  });

  const { data: expenses = [] } = useQuery<any[]>({
    queryKey: ["indian-expenses"],
    queryFn: () => fetch("/api/indian-expenses").then((res) => res.json()),
  });

  const expensesList = Array.isArray(expenses) ? expenses : [];
  const filteredExpenses = expensesList.filter(expense => {
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
        <h1 className="text-2xl font-semibold mb-6">Indian Finance Dashboard</h1>

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
              {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Income</h3>
            <p className="text-2xl font-bold text-primary">{formatINR(totalIncome)}</p>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
            <p className="text-2xl font-bold text-destructive">{formatINR(totalExpenses)}</p>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Net Savings</h3>
            <p className="text-2xl font-bold text-green-600">{formatINR(savings)}</p>
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Expenses by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatINR(value as number)}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </Layout>
  );
}