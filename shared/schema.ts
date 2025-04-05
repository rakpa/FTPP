import { pgTable, text, serial, integer, boolean, timestamp, varchar, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const indianExpenses = pgTable("indian_expenses", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const salaries = pgTable("salaries", {
  id: serial("id").primaryKey(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  notes: text("notes"),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export const insertIndianExpenseSchema = createInsertSchema(indianExpenses).omit({
  id: true,
  createdAt: true,
});

export const insertSalarySchema = createInsertSchema(salaries).omit({
  id: true,
  createdAt: true,
});

export const expenseSchema = z.object({
  id: z.number(),
  category: z.string(),
  description: z.string().nullable().optional(),
  amount: z.number().or(z.string().transform(val => Number(val))), // Handle both number and string
  date: z.string().or(z.date()),
  createdAt: z.string().or(z.date()).optional(),
});

export const indianExpenseSchema = z.object({
  id: z.number(),
  category: z.string(),
  description: z.string().nullable().optional(),
  amount: z.number().or(z.string().transform(val => Number(val))), // Handle both number and string
  date: z.string().or(z.date()),
  createdAt: z.string().or(z.date()).optional(),
});

export const salarySchema = z.object({
  id: z.number(),
  amount: z.number().or(z.string().transform(val => Number(val))), // Handle both number and string
  month: z.string(),
  year: z.number(),
  notes: z.string().nullable().optional(),
  date: z.string().or(z.date()),
  createdAt: z.string().or(z.date()).optional(),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

export type InsertIndianExpense = z.infer<typeof insertIndianExpenseSchema>;
export type IndianExpense = typeof indianExpenses.$inferSelect;

export type InsertSalary = z.infer<typeof insertSalarySchema>;
export type Salary = typeof salaries.$inferSelect;
