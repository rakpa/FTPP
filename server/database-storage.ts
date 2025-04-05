import { eq } from 'drizzle-orm';
import { db } from './db';
import { expenses, indianExpenses, salaries } from '../shared/schema';
import { IStorage } from './storage';
import type { InsertExpense, Expense, InsertIndianExpense, IndianExpense, InsertSalary, Salary } from '../shared/schema';

// Helper function to convert amount to string safely
function safeToString(val: any): string {
  if (val === null || val === undefined) return '0';
  return typeof val === 'string' ? val : String(val);
}

// Create a class that implements the IStorage interface using the database
export class DatabaseStorage implements IStorage {
  async getExpenses(): Promise<Expense[]> {
    try {
      const results = await db.select().from(expenses).orderBy(expenses.date);
      return results.map(row => ({
        ...row,
        amount: typeof row.amount === 'string' ? row.amount : row.amount.toString()
      }));
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    try {
      const results = await db.select().from(expenses).where(eq(expenses.id, id));
      if (!results.length) return undefined;
      
      const row = results[0];
      return {
        ...row,
        amount: typeof row.amount === 'string' ? row.amount : row.amount.toString()
      };
    } catch (error) {
      console.error(`Error getting expense ${id}:`, error);
      return undefined;
    }
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    try {
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
      const row = result[0];
      
      return {
        ...row,
        amount: typeof row.amount === 'string' ? row.amount : row.amount.toString()
      };
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  async deleteExpense(id: number): Promise<boolean> {
    try {
      const result = await db.delete(expenses).where(eq(expenses.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting expense ${id}:`, error);
      return false;
    }
  }
  
  async getIndianExpenses(): Promise<IndianExpense[]> {
    try {
      const results = await db.select().from(indianExpenses).orderBy(indianExpenses.date);
      return results.map(row => ({
        ...row,
        amount: typeof row.amount === 'string' ? row.amount : row.amount.toString()
      }));
    } catch (error) {
      console.error('Error getting Indian expenses:', error);
      return [];
    }
  }

  async getIndianExpense(id: number): Promise<IndianExpense | undefined> {
    try {
      const results = await db.select().from(indianExpenses).where(eq(indianExpenses.id, id));
      if (!results.length) return undefined;
      
      const row = results[0];
      return {
        ...row,
        amount: typeof row.amount === 'string' ? row.amount : row.amount.toString()
      };
    } catch (error) {
      console.error(`Error getting Indian expense ${id}:`, error);
      return undefined;
    }
  }

  async createIndianExpense(insertIndianExpense: InsertIndianExpense): Promise<IndianExpense> {
    try {
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
      const row = result[0];
      
      return {
        ...row,
        amount: typeof row.amount === 'string' ? row.amount : row.amount.toString()
      };
    } catch (error) {
      console.error('Error creating Indian expense:', error);
      throw error;
    }
  }

  async deleteIndianExpense(id: number): Promise<boolean> {
    try {
      const result = await db.delete(indianExpenses).where(eq(indianExpenses.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting Indian expense ${id}:`, error);
      return false;
    }
  }
  
  async getSalaries(): Promise<Salary[]> {
    try {
      const results = await db.select().from(salaries).orderBy(salaries.date);
      return results.map(row => ({
        ...row,
        amount: typeof row.amount === 'string' ? row.amount : row.amount.toString()
      }));
    } catch (error) {
      console.error('Error getting salaries:', error);
      return [];
    }
  }

  async getSalary(id: number): Promise<Salary | undefined> {
    try {
      const results = await db.select().from(salaries).where(eq(salaries.id, id));
      if (!results.length) return undefined;
      
      const row = results[0];
      return {
        ...row,
        amount: typeof row.amount === 'string' ? row.amount : row.amount.toString()
      };
    } catch (error) {
      console.error(`Error getting salary ${id}:`, error);
      return undefined;
    }
  }

  async createSalary(insertSalary: InsertSalary): Promise<Salary> {
    try {
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
      const row = result[0];
      
      return {
        ...row,
        amount: typeof row.amount === 'string' ? row.amount : row.amount.toString()
      };
    } catch (error) {
      console.error('Error creating salary:', error);
      throw error;
    }
  }

  async updateSalary(id: number, updateData: Partial<InsertSalary>): Promise<Salary | undefined> {
    try {
      // Convert date if provided
      const dataToUpdate: any = { ...updateData };
      
      if (dataToUpdate.date) {
        dataToUpdate.date = new Date(dataToUpdate.date);
      }
      
      const result = await db.update(salaries)
        .set(dataToUpdate)
        .where(eq(salaries.id, id))
        .returning();
      
      if (!result.length) return undefined;
      
      const row = result[0];
      return {
        ...row,
        amount: typeof row.amount === 'string' ? row.amount : row.amount.toString()
      };
    } catch (error) {
      console.error(`Error updating salary ${id}:`, error);
      return undefined;
    }
  }

  async deleteSalary(id: number): Promise<boolean> {
    try {
      const result = await db.delete(salaries).where(eq(salaries.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting salary ${id}:`, error);
      return false;
    }
  }
}