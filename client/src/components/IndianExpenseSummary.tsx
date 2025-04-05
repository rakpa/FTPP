import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIndianCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface IndianExpense {
  id: number;
  category: string;
  description?: string | null;
  amount: number;
  date: string | Date;
  createdAt?: string | Date;
}

export function IndianExpenseSummary() {
  const { data: expenses, isLoading } = useQuery<IndianExpense[]>({ 
    queryKey: ['/api/indian-expenses'],
  });
  
  const expensesList = expenses || [];

  if (isLoading) {
    return <ExpenseSummarySkeleton />;
  }

  // Calculate total expenses
  const totalExpenses = expensesList.reduce((sum: number, exp: IndianExpense) => 
    sum + Number(exp.amount), 0);

  // Get this month's expenses
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const thisMonthExpenses = expensesList
    .filter((expense: IndianExpense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    })
    .reduce((sum: number, exp: IndianExpense) => sum + Number(exp.amount), 0);

  // Calculate category with highest spending
  const categoryTotals: Record<string, number> = {};
  
  expensesList.forEach((expense: IndianExpense) => {
    const { category, amount } = expense;
    categoryTotals[category] = (categoryTotals[category] || 0) + Number(amount);
  });
  
  let highestCategory = 'None';
  let highestAmount = 0;
  
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    if (amount > highestAmount) {
      highestCategory = category;
      highestAmount = amount as number;
    }
  });

  const summaryItems = [
    {
      title: "Total Expenses",
      value: formatIndianCurrency(totalExpenses),
      className: "bg-purple-50 border-purple-200"
    },
    {
      title: "This Month",
      value: formatIndianCurrency(thisMonthExpenses),
      className: "bg-blue-50 border-blue-200"
    },
    {
      title: "Highest Category",
      value: highestCategory,
      subValue: highestAmount ? formatIndianCurrency(highestAmount) : "₹0.00",
      className: "bg-amber-50 border-amber-200"
    },
  ];

  return (
    <div className="mt-4 space-y-4">
      <h3 className="font-medium text-lg">Summary</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryItems.map((item, index) => (
          <Card key={index} className={`border ${item.className}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{item.value}</div>
              {item.subValue && (
                <div className="text-sm text-gray-500">{item.subValue}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ExpenseSummarySkeleton() {
  return (
    <div className="mt-4 space-y-4">
      <h3 className="font-medium text-lg">Summary</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="border">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}