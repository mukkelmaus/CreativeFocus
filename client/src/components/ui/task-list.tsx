import { useState, useMemo, useEffect } from 'react';
import { TaskCard } from './task-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from '@/hooks/use-categories';
import { useTasks } from '@/hooks/use-tasks';
import { useFocusMode } from '@/hooks/use-focus-mode';
import { TaskWithCategory, DashboardFilters, ViewType } from '@/lib/types';
import { TaskPriority, TaskStatus } from '@shared/schema';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface TaskListProps {
  title: string;
  showFilters?: boolean;
  onBreakdown?: (taskId: number) => void;
  onEditTask: (task: TaskWithCategory) => void;
}

export function TaskList({ title, showFilters = true, onBreakdown, onEditTask }: TaskListProps) {
  const { tasks, isLoading, completeTask, deleteTask } = useTasks();
  const { categories } = useCategories();
  const { isFocusModeEnabled, getFocusModeSettings } = useFocusMode();
  
  const [filters, setFilters] = useState<DashboardFilters>({
    view: 'list',
    showCompleted: false,
    sortBy: 'priority',
    categories: [],
    searchQuery: '',
  });

  const [taskBreakdownId, setTaskBreakdownId] = useState<number | null>(null);
  
  // Combine tasks with their categories
  const tasksWithCategories: TaskWithCategory[] = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      category: categories.find(cat => cat.id === task.categoryId)
    }));
  }, [tasks, categories]);

  // Apply filters and sorting
  const filteredTasks = useMemo(() => {
    let result = [...tasksWithCategories];
    
    // Focus mode filtering
    if (isFocusModeEnabled) {
      const focusSettings = getFocusModeSettings();
      
      result = result.filter(task => {
        // High priority filter
        if (focusSettings.showHighPriority && task.priority === TaskPriority.HIGH) {
          return true;
        }
        
        // Today's tasks filter
        if (focusSettings.showTodayTasks && task.dueDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate.getTime() === today.getTime()) {
            return true;
          }
        }
        
        // Medium priority filter
        if (focusSettings.showMediumPriority && task.priority === TaskPriority.MEDIUM) {
          return true;
        }
        
        return false;
      });
    } else {
      // Standard filtering
      
      // Filter by completion status
      if (!filters.showCompleted) {
        result = result.filter(task => !task.completed);
      }
      
      // Filter by categories
      if (filters.categories.length > 0) {
        result = result.filter(task => 
          task.categoryId ? filters.categories.includes(task.categoryId) : false
        );
      }
      
      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        result = result.filter(task => 
          task.title.toLowerCase().includes(query) || 
          (task.description && task.description.toLowerCase().includes(query))
        );
      }
    }
    
    // Sort tasks
    switch (filters.sortBy) {
      case 'priority':
        // Sort by priority (high -> medium -> low)
        const priorityOrder = { [TaskPriority.HIGH]: 0, [TaskPriority.MEDIUM]: 1, [TaskPriority.LOW]: 2 };
        result.sort((a, b) => {
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          // If same priority, sort by due date
          if (!a.dueDate && b.dueDate) return 1;
          if (a.dueDate && !b.dueDate) return -1;
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          return 0;
        });
        break;
      case 'dueDate':
        // Sort by due date (ascending)
        result.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'title':
        // Sort alphabetically
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'category':
        // Sort by category name
        result.sort((a, b) => {
          const catA = a.category?.name || '';
          const catB = b.category?.name || '';
          return catA.localeCompare(catB);
        });
        break;
    }
    
    return result;
  }, [tasksWithCategories, filters, isFocusModeEnabled, getFocusModeSettings]);

  // Group tasks by status for kanban view
  const tasksByStatus = useMemo(() => {
    const grouped = {
      [TaskStatus.TODO]: [] as TaskWithCategory[],
      [TaskStatus.IN_PROGRESS]: [] as TaskWithCategory[],
      [TaskStatus.COMPLETED]: [] as TaskWithCategory[]
    };
    
    filteredTasks.forEach(task => {
      grouped[task.status].push(task);
    });
    
    return grouped;
  }, [filteredTasks]);

  // Handle view change
  const handleViewChange = (view: ViewType) => {
    setFilters(prev => ({ ...prev, view }));
  };

  // Handle task breakdown
  const handleTaskBreakdown = (taskId: number) => {
    setTaskBreakdownId(taskId);
    if (onBreakdown) {
      onBreakdown(taskId);
    }
  };

  // Determine if there are any tasks to display
  const hasFilteredTasks = useMemo(() => {
    return filteredTasks.length > 0;
  }, [filteredTasks]);

  // Render content based on the selected view
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!hasFilteredTasks) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No tasks to display</p>
          <Button className="mt-4" onClick={() => console.log('Add task')}>Add Task</Button>
        </div>
      );
    }

    switch (filters.view) {
      case 'list':
        return (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onComplete={completeTask.mutate}
                onEdit={onEditTask}
                onDelete={deleteTask.mutate}
                onBreakdown={handleTaskBreakdown}
                viewType="list"
              />
            ))}
          </div>
        );
      case 'card':
        return (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onComplete={completeTask.mutate}
                onEdit={onEditTask}
                onDelete={deleteTask.mutate}
                onBreakdown={handleTaskBreakdown}
                viewType="card"
              />
            ))}
          </div>
        );
      case 'board':
        return (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {/* Todo column */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">To Do</h3>
              <div className="space-y-3">
                {tasksByStatus[TaskStatus.TODO].map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onComplete={completeTask.mutate}
                    onEdit={onEditTask}
                    onDelete={deleteTask.mutate}
                    onBreakdown={handleTaskBreakdown}
                    viewType="kanban"
                  />
                ))}
              </div>
            </div>
            
            {/* In Progress column */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">In Progress</h3>
              <div className="space-y-3">
                {tasksByStatus[TaskStatus.IN_PROGRESS].map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onComplete={completeTask.mutate}
                    onEdit={onEditTask}
                    onDelete={deleteTask.mutate}
                    onBreakdown={handleTaskBreakdown}
                    viewType="kanban"
                  />
                ))}
              </div>
            </div>
            
            {/* Completed column */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Completed</h3>
              <div className="space-y-3">
                {tasksByStatus[TaskStatus.COMPLETED].map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onComplete={completeTask.mutate}
                    onEdit={onEditTask}
                    onDelete={deleteTask.mutate}
                    onBreakdown={handleTaskBreakdown}
                    viewType="kanban"
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="py-4 text-center">
            <p className="text-gray-500">Calendar view is not implemented in this demo.</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Render filter controls
  const renderFilters = () => {
    if (!showFilters) return null;
    
    return (
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="bg-white border border-gray-300 rounded-md flex items-center">
          <button 
            className={`px-3 py-1.5 text-sm font-medium ${filters.view === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-50'} rounded-l-md`}
            onClick={() => handleViewChange('list')}
          >
            List
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium ${filters.view === 'board' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => handleViewChange('board')}
          >
            Board
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium ${filters.view === 'calendar' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => handleViewChange('calendar')}
          >
            Calendar
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium ${filters.view === 'card' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-50'} rounded-r-md`}
            onClick={() => handleViewChange('card')}
          >
            Card
          </button>
        </div>
        
        <Select 
          value={filters.sortBy} 
          onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Sort by Priority</SelectItem>
            <SelectItem value="dueDate">Sort by Due Date</SelectItem>
            <SelectItem value="title">Sort by Title</SelectItem>
            <SelectItem value="category">Sort by Category</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          placeholder="Search tasks..."
          value={filters.searchQuery}
          onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
          className="w-full md:w-auto"
        />
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 font-heading">{title}</h2>
      </div>
      
      {renderFilters()}
      
      {renderContent()}
      
      {/* Task Breakdown Dialog */}
      <Dialog open={!!taskBreakdownId} onOpenChange={() => setTaskBreakdownId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Task Breakdown</DialogTitle>
            <DialogDescription>
              AI is analyzing this task to help break it down into manageable steps.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
