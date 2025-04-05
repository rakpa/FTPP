import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ExpenseCategory } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
    .replace(',', ',')
    .replace(/\s/g, ' ');
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  try {
    return format(new Date(date), 'dd-MM-yyyy');
  } catch (error) {
    return 'Invalid date';
  }
}

export function getCategoryIcon(category: string): string {
  const icons: Record<ExpenseCategory, string> = {
    'Rent': 'home',
    'Food': 'utensils',
    'Transportation': 'car',
    'Utilities': 'bolt',
    'Entertainment': 'film',
    'Healthcare': 'heart-pulse',
    'Other': 'shopping-bag'
  };
  
  return icons[category as ExpenseCategory] || 'receipt';
}

export function getCategoryColorClass(category: string): string {
  const colors: Record<ExpenseCategory, string> = {
    'Rent': 'bg-purple-100 text-purple-800',
    'Food': 'bg-green-100 text-green-800',
    'Transportation': 'bg-blue-100 text-blue-800',
    'Utilities': 'bg-yellow-100 text-yellow-800',
    'Entertainment': 'bg-pink-100 text-pink-800',
    'Healthcare': 'bg-red-100 text-red-800',
    'Other': 'bg-gray-100 text-gray-800'
  };
  
  return colors[category as ExpenseCategory] || 'bg-gray-100 text-gray-800';
}
