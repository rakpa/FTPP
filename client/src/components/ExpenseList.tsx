import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExpenseItem } from './ExpenseItem';
import { EmptyState } from './EmptyState';
import { Expense, FilterOptions, EXPENSE_CATEGORIES } from '@/types';
import { format, isAfter, isBefore } from 'date-fns';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExpenseList() {
  const [filter, setFilter] = useState<FilterOptions>({
    category: 'all',
    sort: 'date-desc'
  });
  
  // Date filter state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showDateFilters, setShowDateFilters] = useState(false);

  const { data: expenses, isLoading, isError } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
  });

  const handleCategoryChange = (value: string) => {
    setFilter(prev => ({ ...prev, category: value }));
  };

  const handleSortChange = (value: string) => {
    setFilter(prev => ({ ...prev, sort: value as FilterOptions['sort'] }));
  };
  
  // Helper function for date comparisons
  const isDateInRange = (date: string | Date) => {
    const expenseDate = new Date(date);
    
    // Convert times to start of day for proper comparison
    const startOfExpenseDate = new Date(expenseDate);
    startOfExpenseDate.setHours(0, 0, 0, 0);
    
    if (startDate && endDate) {
      // Include the start and end dates in the range (inclusive comparison)
      const startOfStartDate = new Date(startDate);
      startOfStartDate.setHours(0, 0, 0, 0);
      
      const startOfEndDate = new Date(endDate);
      startOfEndDate.setHours(23, 59, 59, 999); // End of the end date
      
      return (startOfExpenseDate >= startOfStartDate) && 
             (startOfExpenseDate <= startOfEndDate);
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

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];

    let filtered = [...expenses];
    
    // Apply category filter
    if (filter.category && filter.category !== 'all') {
      filtered = filtered.filter(expense => expense.category === filter.category);
    }
    
    // Apply date filter
    if (startDate || endDate) {
      filtered = filtered.filter(expense => isDateInRange(expense.date));
    }
    
    // Apply sorting
    switch (filter.sort) {
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'amount-desc':
        filtered.sort((a, b) => Number(b.amount) - Number(a.amount));
        break;
      case 'amount-asc':
        filtered.sort((a, b) => Number(a.amount) - Number(b.amount));
        break;
    }
    
    return filtered;
  }, [expenses, filter, startDate, endDate, isDateInRange]);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p>Failed to load expenses. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="bg-yellow-300 p-4 rounded-lg text-black mb-3">
        <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Select
            value={filter.category}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-white text-gray-800 border-transparent">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EXPENSE_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.sort}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-white text-gray-800 border-transparent">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Date (Newest)</SelectItem>
              <SelectItem value="date-asc">Date (Oldest)</SelectItem>
              <SelectItem value="amount-desc">Amount (High-Low)</SelectItem>
              <SelectItem value="amount-asc">Amount (Low-High)</SelectItem>
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
          <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-4 bg-white p-3 rounded">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
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
                      "w-full pl-3 text-left font-normal",
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
                className="self-end h-9"
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

      {(!expenses || expenses.length === 0) ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          {filteredExpenses.length === 0 ? (
            <div className="p-8">
              <div className="bg-gray-50 border border-gray-200 p-6 text-center">
                <p className="text-gray-500">No expenses match your filter criteria.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {/* Header row - hidden on mobile */}
              <div className="hidden sm:grid grid-cols-12 py-2 px-4 font-medium text-gray-800 border-b border-gray-200 text-sm bg-yellow-200">
                <div className="col-span-3 pl-4">Date</div>
                <div className="col-span-3 pl-2">Category</div>
                <div className="col-span-3 pl-2">Description</div>
                <div className="col-span-2 text-right pr-8">Amount</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>
              
              <div>
                {filteredExpenses.map(expense => (
                  <ExpenseItem key={expense.id} expense={expense} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
