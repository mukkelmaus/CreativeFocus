import { useState } from 'react';
import { useTaskContext } from '@/context/taskContext';
import { useToast } from '@/hooks/use-toast';
import { Task, TaskWithOptionalValues, TASK_PRIORITIES, TASK_STATUS } from '@/lib/types';

export function useTaskActions() {
  const { toast } = useToast();
  const { 
    createTask, 
    updateTask, 
    deleteTask, 
    completeTask, 
    requestTaskBreakdown, 
    setFocusTask, 
    refreshTasks 
  } = useTaskContext();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTask = async (taskData: Partial<Task>) => {
    setIsSubmitting(true);
    try {
      const newTask = await createTask(taskData);
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
      return newTask;
    } catch (error) {
      toast({
        title: "Failed to create task",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
    setIsSubmitting(true);
    try {
      const updatedTask = await updateTask(id, updates);
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
      return updatedTask;
    } catch (error) {
      toast({
        title: "Failed to update task",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    setIsSubmitting(true);
    try {
      await deleteTask(id);
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete task",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTask = async (id: number) => {
    setIsSubmitting(true);
    try {
      const completedTask = await completeTask(id);
      toast({
        title: "Task completed",
        description: "Your task has been marked as completed.",
      });
      return completedTask;
    } catch (error) {
      toast({
        title: "Failed to complete task",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateSubtasks = async (id: number) => {
    setIsSubmitting(true);
    try {
      const result = await requestTaskBreakdown(id);
      toast({
        title: "Subtasks generated",
        description: "AI has generated subtasks for your task.",
      });
      return result;
    } catch (error) {
      toast({
        title: "Failed to generate subtasks",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipFocusTask = (currentTask: TaskWithOptionalValues, tasks: TaskWithOptionalValues[]) => {
    // Find next task to focus on
    const incompleteTasks = tasks.filter(
      task => task.status !== TASK_STATUS.COMPLETED && task.id !== currentTask.id
    );
    
    if (incompleteTasks.length > 0) {
      // First try to find a high priority task
      const nextHighPriorityTask = incompleteTasks.find(task => task.priority === TASK_PRIORITIES.HIGH);
      
      if (nextHighPriorityTask) {
        setFocusTask(nextHighPriorityTask);
      } else {
        // Otherwise, use the first incomplete task
        setFocusTask(incompleteTasks[0]);
      }
      
      toast({
        title: "Focus changed",
        description: "Moved to the next task in your list.",
      });
    } else {
      setFocusTask(null);
      toast({
        title: "No more tasks",
        description: "You've completed all your tasks. Great job!",
      });
    }
  };

  return {
    isSubmitting,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleCompleteTask,
    handleGenerateSubtasks,
    handleSkipFocusTask,
  };
}
