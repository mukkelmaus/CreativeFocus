import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Task, TaskWithOptionalValues, AIWorkflowSuggestion, AIProductivityInsight, TASK_STATUS, ViewMode, SortOption, FilterOption } from '@/lib/types';

interface TaskContextProps {
  tasks: TaskWithOptionalValues[];
  focusTask: TaskWithOptionalValues | null;
  isLoading: boolean;
  viewMode: ViewMode;
  sortBy: SortOption;
  filterBy: FilterOption;
  aiSuggestions: AIWorkflowSuggestion[];
  aiInsights: AIProductivityInsight | null;
  showAiSection: boolean;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortOption) => void;
  setFilterBy: (filter: FilterOption) => void;
  setFocusTask: (task: TaskWithOptionalValues | null) => void;
  toggleAiSection: () => void;
  refreshTasks: () => void;
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  completeTask: (id: number) => Promise<Task>;
  requestTaskBreakdown: (id: number) => Promise<any>;
  refreshAiSuggestions: () => Promise<void>;
}

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [focusTask, setFocusTask] = useState<TaskWithOptionalValues | null>(null);
  const [showAiSection, setShowAiSection] = useState(true);
  
  // Fetch tasks
  const { data: tasks = [], isLoading, refetch: refreshTasks } = useQuery<TaskWithOptionalValues[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Fetch AI workflow suggestions
  const { data: aiSuggestions = [], refetch: refetchAiSuggestions } = useQuery<AIWorkflowSuggestion[]>({
    queryKey: ['/api/ai/workflow'],
    enabled: false, // We'll fetch this explicitly when needed
  });
  
  // Fetch AI productivity insights
  const { data: aiInsights = null, refetch: refetchAiInsights } = useQuery<AIProductivityInsight>({
    queryKey: ['/api/ai/insights'],
    enabled: false, // We'll fetch this explicitly when needed
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Partial<Task>) => {
      const response = await apiRequest('POST', '/api/tasks', newTask);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const response = await apiRequest('PATCH', `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/tasks/${id}/complete`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  // AI task breakdown mutation
  const taskBreakdownMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/ai/breakdown/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  // Set focus task automatically
  useEffect(() => {
    // If no focus task is set and tasks are loaded, set the highest priority non-completed task
    if (!focusTask && tasks.length > 0) {
      const incompleteTasks = tasks.filter(task => task.status !== TASK_STATUS.COMPLETED);
      if (incompleteTasks.length > 0) {
        // First try to find a high priority task
        const highPriorityTask = incompleteTasks.find(task => task.priority === 'high');
        if (highPriorityTask) {
          setFocusTask(highPriorityTask);
        } else {
          // Otherwise, just use the first incomplete task
          setFocusTask(incompleteTasks[0]);
        }
      }
    }
  }, [tasks, focusTask]);

  // Helper function to refresh AI suggestions and insights
  const refreshAiSuggestions = async () => {
    await Promise.all([
      refetchAiSuggestions(),
      refetchAiInsights()
    ]);
  };

  // Fetch AI suggestions initially
  useEffect(() => {
    if (tasks.length > 0) {
      refreshAiSuggestions();
    }
  }, [tasks.length]);

  const toggleAiSection = () => {
    setShowAiSection(prev => !prev);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        focusTask,
        isLoading,
        viewMode,
        sortBy,
        filterBy,
        aiSuggestions,
        aiInsights,
        showAiSection,
        setViewMode,
        setSortBy,
        setFilterBy,
        setFocusTask,
        toggleAiSection,
        refreshTasks,
        createTask: (task) => createTaskMutation.mutateAsync(task),
        updateTask: (id, updates) => updateTaskMutation.mutateAsync({ id, updates }),
        deleteTask: (id) => deleteTaskMutation.mutateAsync(id),
        completeTask: (id) => completeTaskMutation.mutateAsync(id),
        requestTaskBreakdown: (id) => taskBreakdownMutation.mutateAsync(id),
        refreshAiSuggestions,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
