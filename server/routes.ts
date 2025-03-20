import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { generateTaskBreakdown, generateWorkflowSuggestions } from "./openai";
import { 
  insertTaskSchema, 
  insertCategorySchema, 
  TaskStatus,
  insertUserPreferencesSchema,
  insertCalendarIntegrationSchema,
  insertWorkspaceSchema,
  insertWorkspaceMemberSchema,
  insertUserSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  authenticate, 
  registerUser, 
  loginUser, 
  AuthRequest 
} from "./auth";

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
  // Authentication Routes
  // ---------------------------------------------------
  
  // Register a new user
  app.post("/api/register", async (req, res) => {
    try {
      const userData = req.body;
      const validatedData = insertUserSchema.parse(userData);
      
      const { user, token } = await registerUser(validatedData);
      
      // Set HTTP-only cookie with the token
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Don't return the password in the response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      if (error.message === "Username already exists") {
        return res.status(400).json({ message: error.message });
      }
      handleValidationError(error, res);
    }
  });
  
  // Login a user
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const { user, token } = await loginUser(username, password);
      
      // Set HTTP-only cookie with the token
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Don't return the password in the response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.message === "Invalid credentials") {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Logout a user
  app.post("/api/logout", (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: "Logged out successfully" });
  });
  
  // Get current user
  app.get("/api/user", authenticate, (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Don't return the password in the response
    const { password, ...userWithoutPassword } = req.user;
    
    res.json(userWithoutPassword);
  });

  // ---------------------------------------------------
  // Task Routes
  // ---------------------------------------------------
  
  // Get all tasks for user
  app.get("/api/tasks", authenticate, async (req: AuthRequest, res) => {
    try {
      // Use the authenticated user's ID
      const userId = req.user!.id;
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

  // ---------------------------------------------------
  // Calendar Integration Routes
  // ---------------------------------------------------
  
  // Get all calendar integrations for user
  app.get("/api/calendar-integrations", async (req, res) => {
    try {
      const userId = 1;
      const integrations = await storage.getCalendarIntegrations(userId);
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching calendar integrations:", error);
      res.status(500).json({ message: "Failed to fetch calendar integrations" });
    }
  });
  
  // Get a specific calendar integration
  app.get("/api/calendar-integrations/:id", async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const integration = await storage.getCalendarIntegrationById(integrationId);
      
      if (!integration) {
        return res.status(404).json({ message: "Calendar integration not found" });
      }
      
      res.json(integration);
    } catch (error) {
      console.error("Error fetching calendar integration:", error);
      res.status(500).json({ message: "Failed to fetch calendar integration" });
    }
  });
  
  // Create a new calendar integration
  app.post("/api/calendar-integrations", async (req, res) => {
    try {
      const userId = 1;
      const integrationData = { ...req.body, userId };
      
      const validatedData = insertCalendarIntegrationSchema.parse(integrationData);
      const integration = await storage.createCalendarIntegration(validatedData);
      
      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating calendar integration:", error);
      handleValidationError(error, res);
    }
  });
  
  // Update a calendar integration
  app.patch("/api/calendar-integrations/:id", async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const integrationData = req.body;
      
      // Validate only the provided fields
      const partialIntegrationSchema = insertCalendarIntegrationSchema.partial();
      const validatedData = partialIntegrationSchema.parse(integrationData);
      
      const updatedIntegration = await storage.updateCalendarIntegration(integrationId, validatedData);
      
      if (!updatedIntegration) {
        return res.status(404).json({ message: "Calendar integration not found" });
      }
      
      res.json(updatedIntegration);
    } catch (error) {
      console.error("Error updating calendar integration:", error);
      handleValidationError(error, res);
    }
  });
  
  // Delete a calendar integration
  app.delete("/api/calendar-integrations/:id", async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const success = await storage.deleteCalendarIntegration(integrationId);
      
      if (!success) {
        return res.status(404).json({ message: "Calendar integration not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting calendar integration:", error);
      res.status(500).json({ message: "Failed to delete calendar integration" });
    }
  });

  // ---------------------------------------------------
  // Workspace Routes
  // ---------------------------------------------------
  
  // Get all workspaces for user
  app.get("/api/workspaces", async (req, res) => {
    try {
      const userId = 1;
      const workspaces = await storage.getWorkspaces(userId);
      res.json(workspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });
  
  // Get a specific workspace
  app.get("/api/workspaces/:id", async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      const workspace = await storage.getWorkspaceById(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      
      res.json(workspace);
    } catch (error) {
      console.error("Error fetching workspace:", error);
      res.status(500).json({ message: "Failed to fetch workspace" });
    }
  });
  
  // Create a new workspace
  app.post("/api/workspaces", async (req, res) => {
    try {
      const userId = 1;
      const workspaceData = { ...req.body, ownerId: userId };
      
      const validatedData = insertWorkspaceSchema.parse(workspaceData);
      const workspace = await storage.createWorkspace(validatedData);
      
      res.status(201).json(workspace);
    } catch (error) {
      console.error("Error creating workspace:", error);
      handleValidationError(error, res);
    }
  });
  
  // Update a workspace
  app.patch("/api/workspaces/:id", async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      const workspaceData = req.body;
      
      // Validate only the provided fields
      const partialWorkspaceSchema = insertWorkspaceSchema.partial();
      const validatedData = partialWorkspaceSchema.parse(workspaceData);
      
      const updatedWorkspace = await storage.updateWorkspace(workspaceId, validatedData);
      
      if (!updatedWorkspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      
      res.json(updatedWorkspace);
    } catch (error) {
      console.error("Error updating workspace:", error);
      handleValidationError(error, res);
    }
  });
  
  // Delete a workspace
  app.delete("/api/workspaces/:id", async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      const success = await storage.deleteWorkspace(workspaceId);
      
      if (!success) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting workspace:", error);
      res.status(500).json({ message: "Failed to delete workspace" });
    }
  });
  
  // ---------------------------------------------------
  // Workspace Members Routes
  // ---------------------------------------------------
  
  // Get all members of a workspace
  app.get("/api/workspaces/:workspaceId/members", async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const members = await storage.getWorkspaceMembers(workspaceId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching workspace members:", error);
      res.status(500).json({ message: "Failed to fetch workspace members" });
    }
  });
  
  // Add a member to a workspace
  app.post("/api/workspaces/:workspaceId/members", async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const memberData = { ...req.body, workspaceId };
      
      const validatedData = insertWorkspaceMemberSchema.parse(memberData);
      const member = await storage.createWorkspaceMember(validatedData);
      
      res.status(201).json(member);
    } catch (error) {
      console.error("Error adding workspace member:", error);
      handleValidationError(error, res);
    }
  });
  
  // Update a workspace member
  app.patch("/api/workspace-members/:id", async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      const memberData = req.body;
      
      // Validate only the provided fields
      const partialMemberSchema = insertWorkspaceMemberSchema.partial();
      const validatedData = partialMemberSchema.parse(memberData);
      
      const updatedMember = await storage.updateWorkspaceMember(memberId, validatedData);
      
      if (!updatedMember) {
        return res.status(404).json({ message: "Workspace member not found" });
      }
      
      res.json(updatedMember);
    } catch (error) {
      console.error("Error updating workspace member:", error);
      handleValidationError(error, res);
    }
  });
  
  // Remove a member from a workspace
  app.delete("/api/workspace-members/:id", async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      const success = await storage.deleteWorkspaceMember(memberId);
      
      if (!success) {
        return res.status(404).json({ message: "Workspace member not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error removing workspace member:", error);
      res.status(500).json({ message: "Failed to remove workspace member" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
