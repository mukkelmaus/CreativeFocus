import {
  User,
  InsertUser,
  Task,
  InsertTask,
  Category,
  InsertCategory,
  TaskHistory,
  InsertTaskHistory,
  UserPreference,
  InsertUserPreference,
  TaskStatus,
  CalendarIntegration,
  InsertCalendarIntegration,
  Workspace,
  InsertWorkspace,
  WorkspaceMember,
  InsertWorkspaceMember,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  getTasksByStatus(userId: number, status: TaskStatus): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  completeTask(id: number): Promise<Task | undefined>;
  
  // Category operations
  getCategories(userId: number): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Task History operations
  getTaskHistory(userId: number): Promise<TaskHistory[]>;
  getTaskHistoryByTaskId(taskId: number): Promise<TaskHistory[]>;
  createTaskHistory(history: InsertTaskHistory): Promise<TaskHistory>;
  
  // User Preference operations
  getUserPreferences(userId: number): Promise<UserPreference | undefined>;
  createUserPreferences(preferences: InsertUserPreference): Promise<UserPreference>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreference>): Promise<UserPreference | undefined>;
  
  // Calendar Integration operations
  getCalendarIntegrations(userId: number): Promise<CalendarIntegration[]>;
  getCalendarIntegrationById(id: number): Promise<CalendarIntegration | undefined>;
  createCalendarIntegration(integration: InsertCalendarIntegration): Promise<CalendarIntegration>;
  updateCalendarIntegration(id: number, integration: Partial<InsertCalendarIntegration>): Promise<CalendarIntegration | undefined>;
  deleteCalendarIntegration(id: number): Promise<boolean>;
  
  // Workspace operations
  getWorkspaces(userId: number): Promise<Workspace[]>;
  getWorkspaceById(id: number): Promise<Workspace | undefined>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  updateWorkspace(id: number, workspace: Partial<InsertWorkspace>): Promise<Workspace | undefined>;
  deleteWorkspace(id: number): Promise<boolean>;
  
  // Workspace Members operations
  getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]>;
  getWorkspaceMemberById(id: number): Promise<WorkspaceMember | undefined>;
  createWorkspaceMember(member: InsertWorkspaceMember): Promise<WorkspaceMember>;
  updateWorkspaceMember(id: number, member: Partial<InsertWorkspaceMember>): Promise<WorkspaceMember | undefined>;
  deleteWorkspaceMember(id: number): Promise<boolean>;
  getWorkspacesByUserId(userId: number): Promise<Workspace[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private categories: Map<number, Category>;
  private taskHistory: Map<number, TaskHistory>;
  private userPreferences: Map<number, UserPreference>;
  private calendarIntegrations: Map<number, CalendarIntegration>;
  private workspaces: Map<number, Workspace>;
  private workspaceMembers: Map<number, WorkspaceMember>;
  private userIdCounter: number;
  private taskIdCounter: number;
  private categoryIdCounter: number;
  private historyIdCounter: number;
  private prefIdCounter: number;
  private calendarIntegrationIdCounter: number;
  private workspaceIdCounter: number;
  private workspaceMemberIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.categories = new Map();
    this.taskHistory = new Map();
    this.userPreferences = new Map();
    this.calendarIntegrations = new Map();
    this.workspaces = new Map();
    this.workspaceMembers = new Map();
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    this.categoryIdCounter = 1;
    this.historyIdCounter = 1;
    this.prefIdCounter = 1;
    this.calendarIntegrationIdCounter = 1;
    this.workspaceIdCounter = 1;
    this.workspaceMemberIdCounter = 1;
    
    // Initialize with some default data
    this.initializeDefaultData();
  }

  private initializeDefaultData(): void {
    // Create a default user
    const defaultUser: InsertUser = {
      username: "demo",
      password: "password",
      email: "demo@example.com",
      displayName: "Demo User",
      avatarUrl: "",
      settings: {}
    };

    const user = this.createUser(defaultUser);

    // Create some default categories
    const categories = [
      { name: "Work", color: "#4338ca", userId: user.id },
      { name: "Personal", color: "#8b5cf6", userId: user.id },
      { name: "Creative", color: "#ec4899", userId: user.id },
      { name: "Health", color: "#10b981", userId: user.id }
    ];

    const createdCategories = categories.map(cat => this.createCategory(cat as InsertCategory));

    // Create some default tasks
    const tasks = [
      {
        title: "Complete project proposal",
        description: "Finalize the project scope, timeline, and resource requirements.",
        priority: "high",
        dueDate: new Date(),
        status: "todo",
        categoryId: createdCategories[0].id,
        userId: user.id
      },
      {
        title: "Schedule team meeting",
        description: "Coordinate with team members about the upcoming project kickoff.",
        priority: "medium",
        dueDate: new Date(new Date().setHours(14, 0, 0, 0)),
        status: "todo",
        categoryId: createdCategories[0].id,
        userId: user.id
      },
      {
        title: "Review monthly budget",
        description: "Check expenses against projections and prepare for quarterly review.",
        priority: "low",
        dueDate: new Date(new Date().setHours(16, 30, 0, 0)),
        status: "todo",
        categoryId: createdCategories[0].id,
        userId: user.id
      },
      {
        title: "Creative brainstorming session",
        description: "Gather inspiration for the new marketing campaign.",
        priority: "medium",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        status: "todo",
        categoryId: createdCategories[2].id,
        userId: user.id
      },
      {
        title: "Weekly yoga class",
        description: "Take time for self-care and relaxation at the studio.",
        priority: "low",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        status: "todo",
        categoryId: createdCategories[3].id,
        userId: user.id
      },
      {
        title: "Client presentation deadline",
        description: "Finalize slides and rehearse for the quarterly review meeting.",
        priority: "high",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 4)),
        status: "todo",
        categoryId: createdCategories[0].id,
        userId: user.id
      }
    ];

    tasks.forEach(task => this.createTask(task as InsertTask));

    // Create default user preferences
    this.createUserPreferences({
      userId: user.id,
      theme: "light",
      defaultView: "list",
      focusModeEnabled: false,
      focusModeDuration: 60,
      showCompletedTasks: true
    });
    
    // Create default workspace
    const workspace = this.createWorkspace({
      name: "Personal Workspace",
      description: "Your personal workspace for tasks and projects",
      ownerId: user.id,
      color: "#4f46e5",
      isPublic: false
    });
    
    // Create default calendar integration
    this.createCalendarIntegration({
      userId: user.id,
      provider: "google",
      name: "Google Calendar",
      accessToken: "",
      refreshToken: "",
      tokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      calendarId: "",
      active: false,
      settings: {}
    });

    // Add some completed tasks to history
    const completedTasks = [
      {
        title: "Website design review",
        description: "Review the latest design mockups from the design team",
        priority: "medium",
        status: "completed",
        completed: true,
        completedAt: new Date(new Date().setHours(new Date().getHours() - 1)),
        categoryId: createdCategories[0].id,
        userId: user.id
      },
      {
        title: "Morning team standup",
        description: "Daily team sync to discuss progress and blockers",
        priority: "medium",
        status: "completed",
        completed: true,
        completedAt: new Date(new Date().setHours(new Date().getHours() - 3)),
        categoryId: createdCategories[0].id,
        userId: user.id
      }
    ];

    completedTasks.forEach(task => {
      const createdTask = this.createTask(task as InsertTask);
      this.createTaskHistory({
        taskId: createdTask.id,
        userId: user.id,
        action: "completed",
        previousStatus: "todo",
        newStatus: "completed"
      });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  async getTasksByStatus(userId: number, status: TaskStatus): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId && task.status === status);
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const now = new Date();
    const newTask: Task = { 
      ...task, 
      id, 
      createdAt: now, 
      updatedAt: now,
      completedAt: task.completed ? now : null
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const now = new Date();
    const updatedTask: Task = { 
      ...task, 
      ...updateData, 
      updatedAt: now,
      completedAt: updateData.completed ? now : task.completedAt
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async completeTask(id: number): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const now = new Date();
    const completedTask: Task = {
      ...task,
      status: TaskStatus.COMPLETED,
      completed: true,
      completedAt: now,
      updatedAt: now
    };

    this.tasks.set(id, completedTask);
    await this.createTaskHistory({
      taskId: id,
      userId: task.userId,
      action: "completed",
      previousStatus: task.status,
      newStatus: TaskStatus.COMPLETED
    });

    return completedTask;
  }

  // Category operations
  async getCategories(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values())
      .filter(category => category.userId === userId);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const now = new Date();
    const newCategory: Category = { ...category, id, createdAt: now };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory: Category = { ...category, ...updateData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Task History operations
  async getTaskHistory(userId: number): Promise<TaskHistory[]> {
    return Array.from(this.taskHistory.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getTaskHistoryByTaskId(taskId: number): Promise<TaskHistory[]> {
    return Array.from(this.taskHistory.values())
      .filter(history => history.taskId === taskId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createTaskHistory(history: InsertTaskHistory): Promise<TaskHistory> {
    const id = this.historyIdCounter++;
    const now = new Date();
    const newHistory: TaskHistory = { ...history, id, timestamp: now };
    this.taskHistory.set(id, newHistory);
    return newHistory;
  }

  // User Preference operations
  async getUserPreferences(userId: number): Promise<UserPreference | undefined> {
    return Array.from(this.userPreferences.values())
      .find(pref => pref.userId === userId);
  }

  async createUserPreferences(preferences: InsertUserPreference): Promise<UserPreference> {
    const id = this.prefIdCounter++;
    const now = new Date();
    const newPreferences: UserPreference = { 
      ...preferences, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.userPreferences.set(id, newPreferences);
    return newPreferences;
  }

  async updateUserPreferences(userId: number, updateData: Partial<InsertUserPreference>): Promise<UserPreference | undefined> {
    const preferences = Array.from(this.userPreferences.values())
      .find(pref => pref.userId === userId);
    
    if (!preferences) return undefined;

    const now = new Date();
    const updatedPreferences: UserPreference = { 
      ...preferences, 
      ...updateData, 
      updatedAt: now 
    };
    
    this.userPreferences.set(preferences.id, updatedPreferences);
    return updatedPreferences;
  }

  // Calendar Integration operations
  async getCalendarIntegrations(userId: number): Promise<CalendarIntegration[]> {
    return Array.from(this.calendarIntegrations.values())
      .filter(integration => integration.userId === userId);
  }

  async getCalendarIntegrationById(id: number): Promise<CalendarIntegration | undefined> {
    return this.calendarIntegrations.get(id);
  }

  async createCalendarIntegration(integration: InsertCalendarIntegration): Promise<CalendarIntegration> {
    const id = this.calendarIntegrationIdCounter++;
    const now = new Date();
    const newIntegration: CalendarIntegration = { 
      ...integration, 
      id, 
      createdAt: now, 
      updatedAt: now,
      lastSynced: null
    };
    this.calendarIntegrations.set(id, newIntegration);
    return newIntegration;
  }

  async updateCalendarIntegration(id: number, updateData: Partial<InsertCalendarIntegration>): Promise<CalendarIntegration | undefined> {
    const integration = this.calendarIntegrations.get(id);
    if (!integration) return undefined;

    const now = new Date();
    const updatedIntegration: CalendarIntegration = { 
      ...integration, 
      ...updateData, 
      updatedAt: now 
    };
    
    this.calendarIntegrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  async deleteCalendarIntegration(id: number): Promise<boolean> {
    return this.calendarIntegrations.delete(id);
  }

  // Workspace operations
  async getWorkspaces(userId: number): Promise<Workspace[]> {
    // Get all workspace IDs where the user is a member
    const memberWorkspaceIds = Array.from(this.workspaceMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.workspaceId);
    
    // Return all workspaces where the user is a member
    return Array.from(this.workspaces.values())
      .filter(workspace => 
        workspace.ownerId === userId || // User is the owner
        memberWorkspaceIds.includes(workspace.id) // User is a member
      );
  }

  async getWorkspaceById(id: number): Promise<Workspace | undefined> {
    return this.workspaces.get(id);
  }

  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const id = this.workspaceIdCounter++;
    const now = new Date();
    const newWorkspace: Workspace = { 
      ...workspace, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.workspaces.set(id, newWorkspace);
    return newWorkspace;
  }

  async updateWorkspace(id: number, updateData: Partial<InsertWorkspace>): Promise<Workspace | undefined> {
    const workspace = this.workspaces.get(id);
    if (!workspace) return undefined;

    const now = new Date();
    const updatedWorkspace: Workspace = { 
      ...workspace, 
      ...updateData, 
      updatedAt: now 
    };
    
    this.workspaces.set(id, updatedWorkspace);
    return updatedWorkspace;
  }

  async deleteWorkspace(id: number): Promise<boolean> {
    // First delete all workspace members
    Array.from(this.workspaceMembers.values())
      .filter(member => member.workspaceId === id)
      .forEach(member => this.workspaceMembers.delete(member.id));
    
    // Then delete the workspace
    return this.workspaces.delete(id);
  }

  // Workspace Members operations
  async getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
    return Array.from(this.workspaceMembers.values())
      .filter(member => member.workspaceId === workspaceId);
  }

  async getWorkspaceMemberById(id: number): Promise<WorkspaceMember | undefined> {
    return this.workspaceMembers.get(id);
  }

  async createWorkspaceMember(member: InsertWorkspaceMember): Promise<WorkspaceMember> {
    const id = this.workspaceMemberIdCounter++;
    const now = new Date();
    const newMember: WorkspaceMember = { 
      ...member, 
      id, 
      joinedAt: now
    };
    this.workspaceMembers.set(id, newMember);
    return newMember;
  }

  async updateWorkspaceMember(id: number, updateData: Partial<InsertWorkspaceMember>): Promise<WorkspaceMember | undefined> {
    const member = this.workspaceMembers.get(id);
    if (!member) return undefined;

    const updatedMember: WorkspaceMember = { 
      ...member, 
      ...updateData
    };
    
    this.workspaceMembers.set(id, updatedMember);
    return updatedMember;
  }

  async deleteWorkspaceMember(id: number): Promise<boolean> {
    return this.workspaceMembers.delete(id);
  }

  async getWorkspacesByUserId(userId: number): Promise<Workspace[]> {
    // This is a more direct way to get workspaces by user ID
    return this.getWorkspaces(userId);
  }
}

export const storage = new MemStorage();
