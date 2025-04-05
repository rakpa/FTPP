import { eq } from 'drizzle-orm';
import { db } from './db';
import { expenses, indianExpenses, salaries } from '../shared/schema';
import { IStorage } from './storage';
import type { InsertExpense, Expense, InsertIndianExpense, IndianExpense, InsertSalary, Salary } from '../shared/schema';

// Helper functions to convert database result to the expected format with proper typing
const formatDbExpense = (expense: any): Expense => {
  return {
    id: expense.id,
    category: expense.category,
    description: expense.description,
    amount: expense.amount.toString(), // Keep as string - will be automatically converted in the UI
    date: expense.date,
    createdAt: expense.created_at
  };
};

const formatDbIndianExpense = (expense: any): IndianExpense => {
  return {
    id: expense.id,
    category: expense.category,
    description: expense.description,
    amount: expense.amount.toString(), // Keep as string - will be automatically converted in the UI
    date: expense.date,
    createdAt: expense.created_at
  };
};

const formatDbSalary = (salary: any): Salary => {
  return {
    id: salary.id,
    amount: salary.amount.toString(), // Keep as string - will be automatically converted in the UI
    month: salary.month,
    year: salary.year,
    notes: salary.notes,
    date: salary.date,
    createdAt: salary.created_at
  };
};

export class DbStorage implements IStorage {
  async getExpenses(): Promise<Expense[]> {
    const results = await db.select().from(expenses).orderBy(expenses.date);
    return results.map(formatDbExpense);
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const results = await db.select().from(expenses).where(eq(expenses.id, id));
    return results.length ? formatDbExpense(results[0]) : undefined;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    // Ensure we have a date
    const dateToUse = insertExpense.date 
      ? new Date(insertExpense.date) 
      : new Date();
    
    const expenseToInsert = {
      category: insertExpense.category,
      description: insertExpense.description || null,
      amount: insertExpense.amount,
      date: dateToUse,
    };
    
    const result = await db.insert(expenses).values(expenseToInsert).returning();
    return formatDbExpense(result[0]);
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id)).returning();
    return result.length > 0;
  }

  async getIndianExpenses(): Promise<IndianExpense[]> {
    const results = await db.select().from(indianExpenses).orderBy(indianExpenses.date);
    return results.map(formatDbIndianExpense);
  }

  async getIndianExpense(id: number): Promise<IndianExpense | undefined> {
    const results = await db.select().from(indianExpenses).where(eq(indianExpenses.id, id));
    return results.length ? formatDbIndianExpense(results[0]) : undefined;
  }

  async createIndianExpense(insertIndianExpense: InsertIndianExpense): Promise<IndianExpense> {
    // Ensure we have a date
    const dateToUse = insertIndianExpense.date 
      ? new Date(insertIndianExpense.date) 
      : new Date();
    
    const expenseToInsert = {
      category: insertIndianExpense.category,
      description: insertIndianExpense.description || null,
      amount: insertIndianExpense.amount,
      date: dateToUse,
    };
    
    const result = await db.insert(indianExpenses).values(expenseToInsert).returning();
    return formatDbIndianExpense(result[0]);
  }

  async deleteIndianExpense(id: number): Promise<boolean> {
    const result = await db.delete(indianExpenses).where(eq(indianExpenses.id, id)).returning();
    return result.length > 0;
  }

  async getSalaries(): Promise<Salary[]> {
    const results = await db.select().from(salaries).orderBy(salaries.date);
    return results.map(formatDbSalary);
  }

  async getSalary(id: number): Promise<Salary | undefined> {
    const results = await db.select().from(salaries).where(eq(salaries.id, id));
    return results.length ? formatDbSalary(results[0]) : undefined;
  }

  async createSalary(insertSalary: InsertSalary): Promise<Salary> {
    // Ensure we have a date
    const dateToUse = insertSalary.date 
      ? new Date(insertSalary.date) 
      : new Date();
    
    const salaryToInsert = {
      amount: insertSalary.amount,
      month: insertSalary.month,
      year: insertSalary.year,
      notes: insertSalary.notes || null,
      date: dateToUse,
    };
    
    const result = await db.insert(salaries).values(salaryToInsert).returning();
    return formatDbSalary(result[0]);
  }

  async updateSalary(id: number, updateData: Partial<InsertSalary>): Promise<Salary | undefined> {
    // Convert date if provided
    const dataToUpdate: any = { ...updateData };
    
    if (dataToUpdate.date) {
      dataToUpdate.date = new Date(dataToUpdate.date);
    }
    
    const result = await db.update(salaries)
      .set(dataToUpdate)
      .where(eq(salaries.id, id))
      .returning();
    
    return result.length ? formatDbSalary(result[0]) : undefined;
  }

  async deleteSalary(id: number): Promise<boolean> {
    const result = await db.delete(salaries).where(eq(salaries.id, id)).returning();
    return result.length > 0;
  }
}