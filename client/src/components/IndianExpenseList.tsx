import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { IndianExpenseItem } from "./IndianExpenseItem";
import { IndianEmptyState } from "./IndianEmptyState";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, Search, Calendar as CalendarIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isAfter, isBefore, isValid, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface IndianExpense {
  id: number;
  category: string;
  description?: string | null;
  amount: number;
  date: string | Date;
  createdAt?: string | Date;
}

type FilterOptions = {
  category: 'all' | string;
  sort: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export function IndianExpenseList() {
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    sort: 'date-desc'
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showDateFilters, setShowDateFilters] = useState(false);
  
  // Fetch expenses
  const { data: expenses, isLoading, isError } = useQuery<IndianExpense[]>({
    queryKey: ['indian-expenses'],
    queryFn: () => fetch('/api/indian-expenses').then(res => {
      if (!res.ok) throw new Error('Failed to fetch expenses');
      return res.json();
    })
  });
  
  // Log expenses data for debugging
  console.log("Indian expenses data:", expenses);

  // Extract all unique categories from expenses
  const categories = expenses
    ? ['all', ...Array.from(new Set(expenses.map(expense => expense.category)))]
    : ['all'];
  
  // Helper function for date comparisons with debugging
  const isDateInRange = (date: string | Date) => {
    const expenseDate = new Date(date);
    
    // Convert times to start of day for proper comparison
    const startOfExpenseDate = new Date(expenseDate);
    startOfExpenseDate.setHours(0, 0, 0, 0);
    
    // Debug log
    console.log("Date comparison:", {
      expenseDate: startOfExpenseDate.toISOString(),
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString()
    });
    
    if (startDate && endDate) {
      // Include the start and end dates in the range (inclusive comparison)
      const startOfStartDate = new Date(startDate);
      startOfStartDate.setHours(0, 0, 0, 0);
      
      const startOfEndDate = new Date(endDate);
      startOfEndDate.setHours(23, 59, 59, 999); // End of the end date
      
      const result = 
        (startOfExpenseDate >= startOfStartDate) && 
        (startOfExpenseDate <= startOfEndDate);
      
      console.log("Range result:", result);
      return result;
    } else if (startDate) {
      const startOfStartDate = new Date(startDate);
      startOfStartDate.setHours(0, 0, 0, 0);
      return startOfExpenseDate >= startOfStartDate;
    } else if (endDate) {
      const startOfEndDate = new Date(endDate);
      startOfEndDate.setHours(23, 59, 59, 999);
      return startOfExpenseDate <= startOfEndDate;
    }
    return true;
  };

  // Filter and sort expenses
  const filteredExpenses = expenses
    ? expenses
        .filter(expense => 
          // Filter by category
          (filters.category === 'all' || expense.category === filters.category) &&
          // Filter by search query
          (searchQuery === "" || 
            expense.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (expense.description && expense.description.toLowerCase().includes(searchQuery.toLowerCase()))
          ) &&
          // Filter by date range
          ((!startDate && !endDate) || isDateInRange(expense.date))
        )
        .sort((a, b) => {
          // Sort by specified order
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          const amountA = Number(a.amount);
          const amountB = Number(b.amount);
          
          switch(filters.sort) {
            case 'date-desc':
              return dateB - dateA;
            case 'date-asc':
              return dateA - dateB;
            case 'amount-desc':
              return amountB - amountA;
            case 'amount-asc':
              return amountA - amountB;
            default:
              return dateB - dateA;
          }
        })
    : [];
  
  // Handle filter changes
  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ ...prev, category: value }));
  };
  
  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sort: value as FilterOptions['sort'] }));
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Indian Expenses</h2>
        </div>
        
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        ))}
      </div>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error loading Indian expenses. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dark Blue Header Section */}
      <div className="bg-blue-700 p-4 rounded-lg text-white">
        <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white text-gray-800 border-transparent">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white text-gray-800 border-transparent">
              <SelectValue placeholder="Date (Newest)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Date (Newest)</SelectItem>
              <SelectItem value="date-asc">Date (Oldest)</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            className="w-full sm:w-auto bg-white text-gray-800 border-transparent"
            onClick={() => setShowDateFilters(!showDateFilters)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {showDateFilters ? "Hide Date Filter" : "Date Filter"}
          </Button>
        </div>
        
        {/* Date Filters */}
        {showDateFilters && (
          <div className="mt-4 flex flex-col sm:flex-row gap-4 bg-white p-3 rounded-md">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal text-gray-900",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      // If end date is earlier than start date, reset it
                      if (date && endDate && isBefore(endDate, date)) {
                        setEndDate(undefined);
                      }
                    }}
                    initialFocus
                    className="text-gray-900"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal text-gray-900",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="text-gray-900"
                    disabled={date => 
                      startDate ? isBefore(date, startDate) : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                className="self-end h-10"
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Dates
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Expenses List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredExpenses.length > 0 ? (
          <div className="space-y-0">
            {/* Table Header - Only visible on desktop */}
            <div className="hidden md:grid grid-cols-5 bg-blue-700 text-white py-2 px-4 font-medium border-b border-gray-200 text-sm rounded-t-lg">
              <div className="col-span-1 pl-4">Date</div>
              <div className="col-span-1 pl-2">Category</div>
              <div className="col-span-1 pl-2">Description</div>
              <div className="col-span-1 text-center">Amount</div>
              <div className="col-span-1 flex justify-center">Actions</div>
            </div>
            
            <div>
              {filteredExpenses.map(expense => (
                <IndianExpenseItem key={expense.id} expense={expense} />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8">
            <IndianEmptyState />
          </div>
        )}
      </div>
    </div>
  );
}