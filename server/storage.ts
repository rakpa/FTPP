import { type Salary, type InsertSalary, type UpdateSalary, type Expense, type InsertExpense, type UpdateExpense } from "@shared/schema";
import { db } from './db';
import { eq } from 'drizzle-orm';
import { salaries, expenses } from '../shared/schema';

export interface IStorage {
  getSalaries(): Promise<Salary[]>;
  addSalary(salary: Omit<Salary, 'id' | 'createdAt'>): Promise<Salary>;
  updateSalary(id: number, data: Partial<Omit<Salary, 'id' | 'createdAt'>>): Promise<Salary | null>;
  deleteSalary(id: number): Promise<boolean>;
  getExpenses(): Promise<Expense[]>;
  addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense>;
  updateExpense(id: number, data: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<Expense | null>;
  deleteExpense(id: number): Promise<boolean>;
  getIndianExpenses(): Promise<Expense[]>;
  createIndianExpense(expense: InsertExpense): Promise<Expense>;
  deleteIndianExpense(id: number): Promise<boolean>;
}

export class PostgresStorage implements IStorage {
  async getSalaries(): Promise<Salary[]> {
    return await db.select().from(salaries).orderBy(salaries.createdAt);
  }

  async addSalary(insertSalary: Omit<Salary, 'id' | 'createdAt'>): Promise<Salary> {
    const [salary] = await db.insert(salaries).values({
      ...insertSalary,
      amount: Number(insertSalary.amount), // Ensure amount is a number
      createdAt: new Date()
    }).returning();
    return salary;
  }

  async updateSalary(updateSalary: UpdateSalary): Promise<Salary> {
    const { id, ...values } = updateSalary;
    const [salary] = await db
      .update(salaries)
      .set({...values, amount: Number(values.amount)}) //Ensure amount is a number
      .where(eq(salaries.id, id))
      .returning();

    if (!salary) {
      throw new Error(`Salary with id ${id} not found`);
    }

    return salary;
  }
  async deleteSalary(id: number): Promise<boolean> {
    const deleteCount = await db.delete(salaries).where(eq(salaries.id, id));
    return deleteCount > 0;
  }

  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(expenses.createdAt);
  }

  async addExpense(insertExpense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const [expense] = await db.insert(expenses).values({
      ...insertExpense,
      amount: Number(insertExpense.amount), // Ensure amount is a number
      createdAt: insertExpense.date ? new Date(insertExpense.date) : new Date()
    }).returning();
    return expense;
  }

  async updateExpense(updateExpense: UpdateExpense): Promise<Expense> {
    const { id, ...values } = updateExpense;
    const [expense] = await db
      .update(expenses)
      .set({
        ...values,
        amount: Number(values.amount), // Ensure amount is a number
        createdAt: values.date ? new Date(values.date) : undefined
      })
      .where(eq(expenses.id, id))
      .returning();

    if (!expense) {
      throw new Error(`Expense with id ${id} not found`);
    }

    return expense;
  }
  async deleteExpense(id: number): Promise<boolean> {
    const deleteCount = await db.delete(expenses).where(eq(expenses.id, id));
    return deleteCount > 0;
  }
  async getIndianExpenses(): Promise<Expense[]> {
    throw new Error("Method not implemented.");
  }
  async createIndianExpense(expense: InsertExpense): Promise<Expense> {
    throw new Error("Method not implemented.");
  }
  async deleteIndianExpense(id: number): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}

// In-memory storage implementation
interface Salary {
  id: number;
  amount: number;
  month: string;
  year: number;
  notes?: string;
  date: Date;
  createdAt: Date;
}

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}

class InMemoryStorage implements IStorage {
  private salaries: Salary[] = [];
  private expenses: Expense[] = [];
  private indianExpenses: Expense[] = [];
  private salaryId = 1;
  private expenseId = 1;
  private indianExpenseId = 1;

  async getSalaries() {
    return this.salaries;
  }

  async createSalary(data: InsertSalary): Promise<Salary> {
    try {
      const salary = {
        id: this.salaryId++,
        amount: Number(data.amount || 0),
        month: data.month || '',
        year: data.year || new Date().getFullYear(),
        notes: data.notes || '',
        date: data.date ? new Date(data.date) : new Date(),
        createdAt: new Date()
      };
      this.salaries.push(salary);
      return salary;
    } catch (error) {
      console.error('Error creating salary:', error);
      throw error;
    }
  }

  async addSalary(data: Omit<Salary, 'id' | 'createdAt'>) {
    try {
      const salary = {
        id: this.salaryId++,
        amount: Number(data.amount || 0),
        month: data.month || '',
        year: data.year || new Date().getFullYear(),
        notes: data.notes || '',
        date: data.date ? new Date(data.date) : new Date(),
        createdAt: new Date()
      };
      this.salaries.push(salary);
      return salary;
    } catch (error) {
      console.error('Error adding salary:', error);
      throw error;
    }
  }

  async updateSalary(id: number, data: Partial<Omit<Salary, 'id' | 'createdAt'>>) {
    const index = this.salaries.findIndex(s => s.id === id);
    if (index === -1) return null;

    const salary = this.salaries[index];
    const updatedSalary = {
      ...salary,
      ...data,
      amount: data.amount !== undefined ? Number(data.amount) : salary.amount,
      date: data.date ? new Date(data.date) : salary.date
    };

    this.salaries[index] = updatedSalary;
    return updatedSalary;
  }

  async deleteSalary(id: number) {
    const index = this.salaries.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.salaries.splice(index, 1);
    return true;
  }

  async getExpenses() {
    return this.expenses;
  }

  async getIndianExpenses(): Promise<Expense[]> {
    return this.indianExpenses;
  }

  async createExpense(data: InsertExpense): Promise<Expense> {
    const expense = {
      id: this.expenseId++,
      amount: Number(data.amount),
      category: data.category,
      description: data.description || '',
      date: new Date(data.date),
      createdAt: new Date()
    };
    this.expenses.push(expense);
    return expense;
  }

  async addExpense(data: Omit<Expense, 'id' | 'createdAt'>) {
    return this.createExpense(data);
  }

  async updateExpense(id: number, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) {
    const index = this.expenses.findIndex(e => e.id === id);
    if (index === -1) return null;

    const expense = this.expenses[index];
    const updatedExpense = {
      ...expense,
      ...data,
      amount: data.amount !== undefined ? Number(data.amount) : expense.amount,
      date: data.date ? new Date(data.date) : expense.date
    };

    this.expenses[index] = updatedExpense;
    return updatedExpense;
  }

  async deleteExpense(id: number) {
    const index = this.expenses.findIndex(e => e.id === id);
    if (index === -1) return false;

    this.expenses.splice(index, 1);
    return true;
  }

  async createIndianExpense(data: InsertExpense): Promise<Expense> {
    const expense = {
      id: this.indianExpenseId++,
      amount: Number(data.amount),
      category: data.category,
      description: data.description || '',
      date: new Date(data.date),
      createdAt: new Date()
    };
    this.indianExpenses.push(expense);
    return expense;
  }

  async deleteIndianExpense(id: number): Promise<boolean> {
    const index = this.indianExpenses.findIndex(e => e.id === id);
    if (index === -1) return false;
    this.indianExpenses.splice(index, 1);
    return true;
  }
}

export const storage = new InMemoryStorage();