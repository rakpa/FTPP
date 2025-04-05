import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { SalaryItem } from '@/components/SalaryItem';
import { formatCurrency } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the Salary type here for simplicity (should match the server-side type)
interface Salary {
  id: number;
  amount: number;
  month: string;
  year: number;
  notes?: string;
  date: string | Date;
  createdAt?: string | Date;
}

type SalaryFilterOptions = {
  year: number | 'all';
  sort: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

// Generate last 5 years and current year
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);

export function SalaryList() {
  const [filter, setFilter] = useState<SalaryFilterOptions>({
    year: currentYear,
    sort: 'date-desc'
  });

  const { data: salaries, isLoading, isError, refetch } = useQuery<Salary[]>({
    queryKey: ['/api/salaries'],
    retry: 3,
    retryDelay: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    onError: (error) => {
      console.error('Error fetching salaries:', error);
    }
  });

  const handleYearChange = (value: string) => {
    setFilter(prev => ({ 
      ...prev, 
      year: value === 'all' ? 'all' : parseInt(value) 
    }));
  };

  const handleSortChange = (value: string) => {
    setFilter(prev => ({ 
      ...prev, 
      sort: value as SalaryFilterOptions['sort'] 
    }));
  };

  const filteredSalaries = useMemo(() => {
    if (!salaries) return [];

    let filtered = [...salaries];
    
    // Apply year filter
    if (filter.year !== 'all') {
      filtered = filtered.filter(salary => salary.year === filter.year);
    }
    
    // Always sort by month chronologically (January to December) first
    filtered = [...filtered].sort((a, b) => {
      // First compare years
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      
      // If same year, compare months (convert month names to numbers 1-12)
      const monthNames = {
        'January': 1, 'February': 2, 'March': 3, 'April': 4,
        'May': 5, 'June': 6, 'July': 7, 'August': 8,
        'September': 9, 'October': 10, 'November': 11, 'December': 12
      };
      
      const monthA = monthNames[a.month as keyof typeof monthNames] || 0;
      const monthB = monthNames[b.month as keyof typeof monthNames] || 0;
      return monthA - monthB;
    });
    
    // Then apply additional sorting if needed
    switch (filter.sort) {
      case 'date-desc':
        filtered.reverse(); // Simply reverse the chronological order
        break;
      case 'amount-desc':
        filtered.sort((a, b) => Number(b.amount) - Number(a.amount));
        break;
      case 'amount-asc':
        filtered.sort((a, b) => Number(a.amount) - Number(b.amount));
        break;
      // For 'date-asc', we already have the default sort above
    }
    
    return filtered;
  }, [salaries, filter]);

  // The sorting logic is now handled directly in the sort function above

  // Calculate totals
  const calculateTotals = () => {
    if (!filteredSalaries.length) return { total: 0 };
    
    const total = filteredSalaries.reduce((sum, salary) => {
      const amount = parseFloat(salary.amount.toString());
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    return { total };
  };

  const totals = calculateTotals();

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
          <p>Failed to load salary records. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-yellow-300 p-2 rounded mb-3">
        <h2 className="text-xl font-semibold pl-2 mb-2">Salary History</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Select
            value={filter.year === 'all' ? 'all' : filter.year.toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {YEARS.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.sort}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Date (Newest)</SelectItem>
              <SelectItem value="date-asc">Date (Oldest)</SelectItem>
              <SelectItem value="amount-desc">Amount (High-Low)</SelectItem>
              <SelectItem value="amount-asc">Amount (Low-High)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(!salaries || salaries.length === 0) ? (
        <div className="bg-white border border-gray-100 p-12 text-center">
          <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="text-purple-700 h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No salary records yet</h3>
          <p className="text-gray-500">Add your first salary record using the form above.</p>
        </div>
      ) : (
        <div>
          {/* Header row - hidden on mobile */}
          <div className="hidden sm:grid bg-gray-100 border border-gray-200 p-3 mb-2 grid-cols-4 font-medium text-gray-700">
            <div className="col-span-1 pl-2">Month</div>
            <div className="col-span-1">Year</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-1 text-right pr-2">Actions</div>
          </div>
          
          <div className="space-y-0">
            {filteredSalaries.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 p-6 text-center">
                <p className="text-gray-500">No salary records match your filter criteria.</p>
              </div>
            ) : (
              <>
                {filteredSalaries.map(salary => (
                  <SalaryItem key={salary.id} salary={salary} />
                ))}

                {/* Summary row */}
                <div className="bg-gray-100 border border-gray-200 p-3 mt-4 grid grid-cols-2 sm:grid-cols-4 text-gray-900 font-normal">
                  <div className="col-span-1 pl-2 sm:col-span-2">Total Salary</div>
                  <div className="col-span-1 sm:text-left font-normal text-right">{formatCurrency(totals.total)} zł</div>
                  <div className="col-span-1 text-right pr-2 font-normal hidden sm:block"></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}