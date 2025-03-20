import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task, TaskStatus, InsertTask } from "@shared/schema";
import { TaskWithCategory, TaskBreakdown } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Hook to fetch and manage tasks
export function useTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all tasks
  const { data: tasks = [], isLoading, error } = useQuery<TaskWithCategory[]>({
    queryKey: ["/api/tasks"],
  });

  // Get tasks by status
  const getTasksByStatus = (status: TaskStatus) => {
    return useQuery<Task[]>({
      queryKey: ["/api/tasks/status", status],
      enabled: !!status,
    });
  };

  // Add a new task
  const addTask = useMutation({
    mutationFn: async (newTask: Omit<InsertTask, "userId">) => {
      const res = await apiRequest("POST", "/api/tasks", newTask);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task created",
        description: "Your new task has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating task",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update a task
  const updateTask = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertTask>) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating task",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete a task
  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting task",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Complete a task
  const completeTask = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/tasks/${id}/complete`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task completed",
        description: "Your task has been marked as completed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error completing task",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get AI breakdown for a task
  const getTaskBreakdown = (taskId: number) => {
    return useQuery<TaskBreakdown>({
      queryKey: ["/api/ai/task-breakdown", taskId],
      enabled: !!taskId,
    });
  };

  return {
    tasks,
    isLoading,
    error,
    getTasksByStatus,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    getTaskBreakdown,
  };
}
