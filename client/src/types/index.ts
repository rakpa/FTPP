export interface Expense {
  id: number;
  category: string;
  description?: string;
  amount: number;
  date: string | Date;
  createdAt?: string | Date;
}

export interface NewExpense {
  category: string;
  description?: string;
  amount: number;
  date: string | Date;
}

export type FilterOptions = {
  category: 'all' | ExpenseCategory | string;
  sort: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export type ExpenseCategory = string;

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [];

export interface Salary {
  id: number;
  amount: number;
  month: string;
  year: number;
  notes?: string;
  date: string | Date;
  createdAt?: string | Date;
}
