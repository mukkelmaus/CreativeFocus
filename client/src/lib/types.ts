import { Task, Category, TaskHistory, UserPreference, TaskPriority, TaskStatus, TaskView } from "@shared/schema";

export interface TaskWithCategory extends Task {
  category?: Category;
}

export interface TaskBreakdown {
  subtasks: {
    title: string;
    description: string;
    priority: TaskPriority;
    estimatedDuration: number; // in minutes
  }[];
}

export interface WorkflowSuggestion {
  message: string;
  suggestedActions: string[];
}

export interface ThemeSettings {
  theme: "light" | "dark" | "system";
  accentColor: string;
  fontSize: number;
  reduceAnimations: boolean;
}

export type ViewType = TaskView;
export type SortOption = "priority" | "dueDate" | "title" | "category";

export interface FocusModeSettings {
  enabled: boolean;
  duration: number; // in minutes
  showHighPriority: boolean;
  showTodayTasks: boolean;
  showMediumPriority: boolean;
}

export interface DashboardFilters {
  view: ViewType;
  showCompleted: boolean;
  sortBy: SortOption;
  categories: number[];
  searchQuery: string;
}
