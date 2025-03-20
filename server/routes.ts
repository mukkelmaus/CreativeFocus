import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateTaskBreakdown, generateWorkflowSuggestions } from "./openai";
import { 
  insertTaskSchema, 
  insertCategorySchema, 
  TaskStatus,
  insertUserPreferencesSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for validation errors
  const handleValidationError = (error: any, res: any) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationError.details 
      });
    }
    return res.status(500).json({ message: error.message || "Internal server error" });
  };

  // ---------------------------------------------------
  // Task Routes
  // ---------------------------------------------------
  
  // Get all tasks for user
  app.get("/api/tasks", async (req, res) => {
    try {
      // For demo purposes, we'll use user ID 1
      const userId = 1;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get tasks by status
  app.get("/api/tasks/status/:status", async (req, res) => {
    try {
      const userId = 1;
      const status = req.params.status as TaskStatus;
      const tasks = await storage.getTasksByStatus(userId, status);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by status:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get a single task
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  // Create a new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const userId = 1;
      const taskData = { ...req.body, userId };
      
      const validatedData = insertTaskSchema.parse(taskData);
      const task = await storage.createTask(validatedData);
      
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      handleValidationError(error, res);
    }
  });

  // Update a task
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const taskData = req.body;
      
      // Validate only the provided fields
      const partialTaskSchema = insertTaskSchema.partial();
      const validatedData = partialTaskSchema.parse(taskData);
      
      const updatedTask = await storage.updateTask(taskId, validatedData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      handleValidationError(error, res);
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const success = await storage.deleteTask(taskId);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Complete a task
  app.post("/api/tasks/:id/complete", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const completedTask = await storage.completeTask(taskId);
      
      if (!completedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(completedTask);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  // ---------------------------------------------------
  // Category Routes
  // ---------------------------------------------------
  
  // Get all categories for user
  app.get("/api/categories", async (req, res) => {
    try {
      const userId = 1;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create a new category
  app.post("/api/categories", async (req, res) => {
    try {
      const userId = 1;
      const categoryData = { ...req.body, userId };
      
      const validatedData = insertCategorySchema.parse(categoryData);
      const category = await storage.createCategory(validatedData);
      
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      handleValidationError(error, res);
    }
  });

  // Update a category
  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const categoryData = req.body;
      
      // Validate only the provided fields
      const partialCategorySchema = insertCategorySchema.partial();
      const validatedData = partialCategorySchema.parse(categoryData);
      
      const updatedCategory = await storage.updateCategory(categoryId, validatedData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      handleValidationError(error, res);
    }
  });

  // Delete a category
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const success = await storage.deleteCategory(categoryId);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // ---------------------------------------------------
  // Task History Routes
  // ---------------------------------------------------
  
  // Get task history for user
  app.get("/api/task-history", async (req, res) => {
    try {
      const userId = 1;
      const history = await storage.getTaskHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching task history:", error);
      res.status(500).json({ message: "Failed to fetch task history" });
    }
  });

  // Get task history for a specific task
  app.get("/api/task-history/:taskId", async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const history = await storage.getTaskHistoryByTaskId(taskId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching task history:", error);
      res.status(500).json({ message: "Failed to fetch task history" });
    }
  });

  // ---------------------------------------------------
  // User Preferences Routes
  // ---------------------------------------------------
  
  // Get user preferences
  app.get("/api/preferences", async (req, res) => {
    try {
      const userId = 1;
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  // Update user preferences
  app.patch("/api/preferences", async (req, res) => {
    try {
      const userId = 1;
      const preferencesData = req.body;
      
      // Validate only the provided fields
      const partialPreferencesSchema = insertUserPreferencesSchema.partial();
      const validatedData = partialPreferencesSchema.parse(preferencesData);
      
      const updatedPreferences = await storage.updateUserPreferences(userId, validatedData);
      
      if (!updatedPreferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }
      
      res.json(updatedPreferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      handleValidationError(error, res);
    }
  });

  // ---------------------------------------------------
  // AI Features Routes
  // ---------------------------------------------------
  
  // Generate task breakdown suggestions
  app.get("/api/ai/task-breakdown/:taskId", async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const breakdown = await generateTaskBreakdown(task, task.userId);
      res.json(breakdown);
    } catch (error) {
      console.error("Error generating task breakdown:", error);
      res.status(500).json({ message: "Failed to generate task breakdown" });
    }
  });

  // Generate workflow optimization suggestions
  app.get("/api/ai/workflow-suggestions", async (req, res) => {
    try {
      const userId = 1;
      const tasks = await storage.getTasks(userId);
      
      const suggestions = await generateWorkflowSuggestions(tasks, userId);
      res.json(suggestions);
    } catch (error) {
      console.error("Error generating workflow suggestions:", error);
      res.status(500).json({ message: "Failed to generate workflow suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
