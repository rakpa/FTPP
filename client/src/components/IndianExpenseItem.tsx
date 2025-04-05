import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatIndianCurrency, formatDate, getCategoryIcon, getCategoryColorClass } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Receipt, ShoppingCart, Home, Car, Utensils, Film, HeartPulse, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IndianExpense {
  id: number;
  category: string;
  description?: string | null;
  amount: number;
  date: string | Date;
  createdAt?: string | Date;
}

interface IndianExpenseItemProps {
  expense: IndianExpense;
}

export function IndianExpenseItem({ expense }: IndianExpenseItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Mutation for deleting an expense
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/indian-expenses/${id}`),
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/indian-expenses'] });
      
      // Show success message
      toast({
        title: "Success",
        description: "Indian expense has been deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete Indian expense",
        variant: "destructive",
      });
      console.error("Error deleting Indian expense:", error);
    }
  });

  // Determine the icon component to use based on category
  const getIconForCategory = (category: string) => {
    const iconName = getCategoryIcon(category);
    
    switch (iconName) {
      case 'receipt':
        return Receipt;
      case 'shoppingCart':
        return ShoppingCart;
      case 'home':
        return Home;
      case 'car':
        return Car;
      case 'utensils':
        return Utensils;
      case 'film':
        return Film;
      case 'heartPulse':
        return HeartPulse;
      case 'briefcase':
        return Briefcase;
      default:
        return Receipt;
    }
  };
  
  const IconComponent = getIconForCategory(expense.category);

  return (
    <>
      {/* Desktop view */}
      <div 
        className="hidden md:grid grid-cols-5 py-2 px-4 border-b border-gray-200 hover:bg-gray-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Date column */}
        <div className="col-span-1 text-sm">
          <span className="pl-4">{formatDate(expense.date)}</span>
        </div>
        
        {/* Category column */}
        <div className="col-span-1 flex items-center gap-2 text-sm pl-2">
          <div className={`p-1 rounded-full ${getCategoryColorClass(expense.category)}`}>
            <IconComponent className="h-3.5 w-3.5" />
          </div>
          <span>{expense.category}</span>
        </div>
        
        {/* Description column */}
        <div className="col-span-1 pl-2">
          {expense.description && (
            <div className="inline-block px-2 py-0.5 rounded text-xs text-gray-700">
              {expense.description}
            </div>
          )}
        </div>
        
        {/* Amount column */}
        <div className="col-span-1 flex justify-center font-bold text-sm">
          <span>{formatIndianCurrency(Number(expense.amount))}</span>
        </div>
        
        {/* Actions column */}
        <div className="col-span-1 flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:bg-red-50 h-8"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span>Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this Indian expense? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate(expense.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {/* Mobile view */}
      <div className="md:hidden p-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-full ${getCategoryColorClass(expense.category)}`}>
              <IconComponent className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium text-sm">{expense.category}</span>
          </div>
          <div className="font-bold text-sm">
            {formatIndianCurrency(Number(expense.amount))}
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <div>{formatDate(expense.date)}</div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:bg-red-50 h-6 px-2 py-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this Indian expense? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate(expense.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        {expense.description && (
          <div className="px-2 py-0.5 rounded text-xs text-gray-700">
            {expense.description}
          </div>
        )}
      </div>
    </>
  );
}