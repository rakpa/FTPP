import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema, insertIndianExpenseSchema, insertSalarySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";

// Create a custom schema for API validation that accepts date as a string
const apiInsertExpenseSchema = insertExpenseSchema.extend({
  date: z.string().or(z.date()),
  amount: z.string().or(z.number())
});

// Create a custom schema for API validation for Indian expenses
const apiInsertIndianExpenseSchema = insertIndianExpenseSchema.extend({
  date: z.string().or(z.date()),
  amount: z.string().or(z.number())
});

// Create a custom schema for API validation for salary
const apiInsertSalarySchema = insertSalarySchema.extend({
  date: z.string().or(z.date()).optional(),
  amount: z.string().or(z.number()),
  bonuses: z.string().or(z.number()).optional(),
  deductions: z.string().or(z.number()).optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Expenses API
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve expenses" });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      
      const expense = await storage.getExpense(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve expense" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const result = apiInsertExpenseSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Convert and standardize data types for storage
      const parsedData = {
        category: result.data.category,
        description: result.data.description,
        // Ensure amount is a string for storage
        amount: typeof result.data.amount === 'number' 
          ? result.data.amount.toString() 
          : result.data.amount || "0",
        // Ensure date is properly converted to Date object if it's a string
        date: typeof result.data.date === 'string'
          ? new Date(result.data.date)
          : result.data.date || new Date()
      };
      
      const newExpense = await storage.createExpense(parsedData);
      res.status(201).json(newExpense);
    } catch (error) {
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Indian Expenses API
  app.get("/api/indian-expenses", async (req, res) => {
    try {
      const indianExpenses = await storage.getIndianExpenses();
      res.json(indianExpenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve Indian expenses" });
    }
  });

  app.get("/api/indian-expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid Indian expense ID" });
      }
      
      const indianExpense = await storage.getIndianExpense(id);
      if (!indianExpense) {
        return res.status(404).json({ message: "Indian expense not found" });
      }
      
      res.json(indianExpense);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve Indian expense" });
    }
  });

  app.post("/api/indian-expenses", async (req, res) => {
    try {
      const result = apiInsertIndianExpenseSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Convert and standardize data types for storage
      const parsedData = {
        category: result.data.category,
        description: result.data.description,
        // Ensure amount is a string for storage
        amount: typeof result.data.amount === 'number' 
          ? result.data.amount.toString() 
          : result.data.amount || "0",
        // Ensure date is properly converted to Date object if it's a string
        date: typeof result.data.date === 'string'
          ? new Date(result.data.date)
          : result.data.date || new Date()
      };
      
      const newIndianExpense = await storage.createIndianExpense(parsedData);
      res.status(201).json(newIndianExpense);
    } catch (error) {
      res.status(500).json({ message: "Failed to create Indian expense" });
    }
  });

  app.delete("/api/indian-expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid Indian expense ID" });
      }
      
      const deleted = await storage.deleteIndianExpense(id);
      if (!deleted) {
        return res.status(404).json({ message: "Indian expense not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete Indian expense" });
    }
  });

  // Salaries API
  app.get("/api/salaries", async (req, res) => {
    try {
      const salaries = await storage.getSalaries();
      res.json(salaries);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve salaries" });
    }
  });

  app.get("/api/salaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid salary ID" });
      }
      
      const salary = await storage.getSalary(id);
      if (!salary) {
        return res.status(404).json({ message: "Salary not found" });
      }
      
      res.json(salary);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve salary" });
    }
  });

  app.post("/api/salaries", async (req, res) => {
    try {
      const result = apiInsertSalarySchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Convert and standardize data types for storage
      const parsedData = {
        amount: typeof result.data.amount === 'number' 
          ? result.data.amount.toString() 
          : result.data.amount || "0",
        month: result.data.month,
        year: result.data.year,
        bonuses: typeof result.data.bonuses === 'number'
          ? result.data.bonuses.toString()
          : result.data.bonuses || "0",
        deductions: typeof result.data.deductions === 'number'
          ? result.data.deductions.toString()
          : result.data.deductions || "0",
        notes: result.data.notes,
        date: typeof result.data.date === 'string'
          ? new Date(result.data.date)
          : result.data.date || new Date()
      };
      
      const newSalary = await storage.createSalary(parsedData);
      res.status(201).json(newSalary);
    } catch (error) {
      res.status(500).json({ message: "Failed to create salary" });
    }
  });

  app.patch("/api/salaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid salary ID" });
      }
      
      // Use a partial schema for validation
      const result = apiInsertSalarySchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Parse the amount if provided
      let updateData: any = { ...result.data };
      if (updateData.amount !== undefined) {
        updateData.amount = typeof updateData.amount === 'number'
          ? updateData.amount.toString()
          : updateData.amount;
      }
      
      // Convert date if provided
      if (updateData.date !== undefined) {
        updateData.date = typeof updateData.date === 'string'
          ? new Date(updateData.date)
          : updateData.date;
      }
      
      const updatedSalary = await storage.updateSalary(id, updateData);
      if (!updatedSalary) {
        return res.status(404).json({ message: "Salary not found" });
      }
      
      res.json(updatedSalary);
    } catch (error) {
      res.status(500).json({ message: "Failed to update salary" });
    }
  });

  app.delete("/api/salaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid salary ID" });
      }
      
      const deleted = await storage.deleteSalary(id);
      if (!deleted) {
        return res.status(404).json({ message: "Salary not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete salary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
