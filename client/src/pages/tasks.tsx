import { useLocation, useParams } from "wouter";
import { useTasks } from "@/hooks/use-tasks";
import { useCategories } from "@/hooks/use-categories";
import { TaskList } from "@/components/ui/task-list";
import { isToday, addDays, isBefore, isAfter } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskWithCategory } from "@/lib/types";
import { TaskStatus } from "@shared/schema";

interface TasksPageProps {
  onEditTask?: (task: TaskWithCategory) => void;
}

export default function Tasks({ onEditTask }: TasksPageProps) {
  const [location] = useLocation();
  const params = useParams();
  const { tasks, isLoading } = useTasks();
  const { categories, getCategoryById } = useCategories();

  // Combine tasks with their categories
  const tasksWithCategories = tasks.map(task => ({
    ...task,
    category: categories.find(cat => cat.id === task.categoryId)
  }));

  // Determine the page content based on the route
  const getPageContent = () => {
    // If we're on the today route
    if (location === "/today") {
      const todayTasks = tasksWithCategories.filter(task => {
        if (task.status === TaskStatus.COMPLETED) return false;
        if (!task.dueDate) return false;
        return isToday(new Date(task.dueDate));
      });

      return {
        title: "Today's Tasks",
        tasks: todayTasks,
        description: "Focus on completing these tasks today."
      };
    }
    
    // If we're on the upcoming route
    if (location === "/upcoming") {
      const tomorrow = addDays(new Date(), 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const upcomingTasks = tasksWithCategories.filter(task => {
        if (task.status === TaskStatus.COMPLETED) return false;
        if (!task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        return isAfter(dueDate, tomorrow);
      });

      return {
        title: "Upcoming Tasks",
        tasks: upcomingTasks,
        description: "Plan ahead for these upcoming tasks."
      };
    }
    
    // If we're on a category route
    if (location.startsWith("/category/") && params.id) {
      const categoryId = parseInt(params.id);
      const category = getCategoryById(categoryId);
      
      const categoryTasks = tasksWithCategories.filter(task => 
        task.categoryId === categoryId && task.status !== TaskStatus.COMPLETED
      );

      return {
        title: `${category?.name || 'Category'} Tasks`,
        tasks: categoryTasks,
        description: `Tasks in the ${category?.name || 'selected'} category.`
      };
    }

    // Default to all tasks
    return {
      title: "All Tasks",
      tasks: tasksWithCategories.filter(task => task.status !== TaskStatus.COMPLETED),
      description: "View all your active tasks."
    };
  };

  const { title, tasks: filteredTasks, description } = getPageContent();

  // Show loading skeleton if data is loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="space-y-3 mt-8">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>
      
      <TaskList 
        title={filteredTasks.length > 0 ? "" : "No Tasks Found"} 
        showFilters={true}
        onBreakdown={(taskId) => console.log('Breaking down task:', taskId)}
        onEditTask={onEditTask || (() => {})}
      />
    </div>
  );
}
