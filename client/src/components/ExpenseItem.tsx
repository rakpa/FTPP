import { Trash2 } from 'lucide-react';
import { formatCurrency, formatDate, getCategoryIcon, getCategoryColorClass } from '@/lib/utils';
import { Expense } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface ExpenseItemProps {
  expense: Expense;
}

export function ExpenseItem({ expense }: ExpenseItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/expenses/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense deleted successfully",

      });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete expense: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteExpenseMutation.mutate(expense.id);
  };

  const iconName = getCategoryIcon(expense.category);
  const ColorClass = getCategoryColorClass(expense.category);
  
  // Dynamically get the icon component
  const formattedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
  const IconComponent = (LucideIcons as any)[formattedIconName] || LucideIcons.Receipt;

  return (
    <div className="bg-white border border-gray-200 p-3 animate-fadeIn">
      {/* Mobile view */}
      <div className="sm:hidden">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <div className={`w-7 h-7 rounded-full ${ColorClass} flex items-center justify-center mr-2`}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{expense.category}</h3>
              <p className="text-xs text-gray-500">{formatDate(expense.date)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">{formatCurrency(expense.amount)} zł</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          {expense.description ? (
            <div className="flex-1">
              <span className="text-xs text-gray-700">{expense.description}</span>
            </div>
          ) : (
            <div className="flex-1">
              <span className="text-xs text-gray-400">-</span>
            </div>
          )}
          <button 
            className="text-xs text-red-500 hover:text-red-700 flex items-center"
            onClick={handleDelete}
            disabled={deleteExpenseMutation.isPending}
          >
            <Trash2 className="h-3 w-3 mr-1" /> Delete
          </button>
        </div>
      </div>
      
      {/* Desktop view */}
      <div className="hidden sm:grid grid-cols-12 items-center py-2 px-4 hover:bg-gray-50">
        {/* Date column */}
        <div className="col-span-3">
          <p className="text-sm text-gray-700 pl-4">{formatDate(expense.date)}</p>
        </div>
        
        {/* Category column */}
        <div className="col-span-3 flex items-center gap-2 pl-2">
          <div className={`p-1 rounded-full ${ColorClass}`}>
            <IconComponent className="h-3.5 w-3.5" />
          </div>
          <h3 className="font-medium text-sm text-gray-900">{expense.category}</h3>
        </div>
        
        {/* Description column */}
        <div className="col-span-3 pl-2">
          {expense.description ? (
            <span className="text-sm text-gray-700">{expense.description}</span>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
        
        {/* Amount column */}
        <div className="col-span-2 text-right pr-8">
          <div className="font-bold text-sm text-gray-900">{formatCurrency(expense.amount)} zł</div>
        </div>
        
        {/* Actions column */}
        <div className="col-span-1 flex justify-center">
          <button 
            className="text-red-500 hover:bg-red-50 h-8 px-2 py-1 rounded text-sm flex items-center"
            onClick={handleDelete}
            disabled={deleteExpenseMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-1" /> 
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
