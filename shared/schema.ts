import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define Task Priority as an enum
export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// Define Task Status as an enum
export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export enum TaskView {
  LIST = "list",
  BOARD = "board",
  CALENDAR = "calendar",
  CARD = "card",
}

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tasks schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().$type<TaskPriority>(),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().$type<TaskStatus>().default(TaskStatus.TODO),
  categoryId: integer("category_id"),
  userId: integer("user_id").notNull(),
  parentTaskId: integer("parent_task_id"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  aiGenerated: boolean("ai_generated").default(false),
});

// Task History schema
export const taskHistory = pgTable("task_history", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  previousStatus: text("previous_status").$type<TaskStatus>(),
  newStatus: text("new_status").$type<TaskStatus>(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// User Settings schema
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  theme: text("theme").default("light"),
  defaultView: text("default_view").$type<TaskView>().default(TaskView.LIST),
  focusModeEnabled: boolean("focus_mode_enabled").default(false),
  focusModeDuration: integer("focus_mode_duration").default(60), // in minutes
  showCompletedTasks: boolean("show_completed_tasks").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Calendar Integration schema
export const calendarIntegrations = pgTable("calendar_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: text("provider").notNull(), // "google", "outlook", etc.
  name: text("name").notNull(),
  calendarId: text("calendar_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  syncEnabled: boolean("sync_enabled").default(true),
  lastSynced: timestamp("last_synced"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Workspace schema
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Workspace Members schema
export const workspaceMembers = pgTable("workspace_members", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull().default("member"), // "owner", "admin", "member"
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertTaskHistorySchema = createInsertSchema(taskHistory).omit({
  id: true,
  timestamp: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCalendarIntegrationSchema = createInsertSchema(calendarIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSynced: true,
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkspaceMemberSchema = createInsertSchema(workspaceMembers).omit({
  id: true,
  joinedAt: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertTaskHistory = z.infer<typeof insertTaskHistorySchema>;
export type TaskHistory = typeof taskHistory.$inferSelect;

export type InsertUserPreference = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreference = typeof userPreferences.$inferSelect;

export type InsertCalendarIntegration = z.infer<typeof insertCalendarIntegrationSchema>;
export type CalendarIntegration = typeof calendarIntegrations.$inferSelect;

export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Workspace = typeof workspaces.$inferSelect;

export type InsertWorkspaceMember = z.infer<typeof insertWorkspaceMemberSchema>;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
