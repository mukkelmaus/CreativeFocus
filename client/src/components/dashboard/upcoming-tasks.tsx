import { Button } from "@/components/ui/button";
import { TaskWithCategory } from "@/lib/types";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { TaskPriority } from "@shared/schema";
import { format, isTomorrow, addDays, isAfter } from "date-fns";

interface UpcomingTasksProps {
  tasks: TaskWithCategory[];
  onEditTask: (task: TaskWithCategory) => void;
}

export function UpcomingTasks({ tasks, onEditTask }: UpcomingTasksProps) {
  // Filter upcoming tasks (tasks with a due date in the future, excluding today)
  const upcomingTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return isAfter(dueDate, today);
  });

  // Group tasks by day (tomorrow, next few days)
  const tomorrowTasks = upcomingTasks.filter(task => 
    task.dueDate && isTomorrow(new Date(task.dueDate))
  );
  
  const nextFewDaysTasks = upcomingTasks.filter(task => {
    if (!task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return isAfter(dueDate, tomorrow);
  }).slice(0, 5); // Limit to 5 tasks

  // Helper function to get card border color based on priority or category
  const getCardBorderColor = (task: TaskWithCategory) => {
    // Use category color as border if available
    if (task.category?.color) {
      return { borderColor: task.category.color };
    }
    
    // Otherwise, use priority color
    switch (task.priority) {
      case TaskPriority.HIGH:
        return { borderColor: "#ef4444" };
      case TaskPriority.MEDIUM:
        return { borderColor: "#f59e0b" };
      case TaskPriority.LOW:
        return { borderColor: "#10b981" };
      default:
        return { borderColor: "#6366f1" };
    }
  };

  // Helper function to format the date
  const formatDate = (dueDate: Date | null | undefined) => {
    if (!dueDate) return "";
    
    if (isTomorrow(new Date(dueDate))) {
      return "Tomorrow";
    }
    
    return format(new Date(dueDate), "EEEE");
  };

  // Render the task card
  const renderTaskCard = (task: TaskWithCategory) => {
    return (
      <div 
        key={task.id}
        className="task-card bg-white rounded-lg shadow-sm p-4 border-t-4"
        style={{ borderTopColor: getCardBorderColor(task).borderColor }}
        onClick={() => onEditTask(task)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">
            {formatDate(task.dueDate)}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            task.priority === TaskPriority.HIGH ? 'bg-red-100 text-red-800' : 
            task.priority === TaskPriority.MEDIUM ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
        <h3 className="text-base font-medium text-gray-800 mb-2">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="inline-block w-6 h-6 rounded-full bg-primary-400 flex items-center justify-center text-xs text-white font-medium">
              {task.category?.name?.charAt(0) || 'T'}
            </span>
            <span 
              className="inline-block w-3 h-3 rounded-full ml-2 mr-1" 
              style={{ backgroundColor: task.category?.color || "#6366f1" }}
            />
            <span className="text-xs text-gray-500">{task.category?.name || 'No Category'}</span>
          </div>
          {task.dueDate && (
            <span className="text-xs text-gray-500">
              {format(new Date(task.dueDate), 'h:mm a')}
            </span>
          )}
        </div>
      </div>
    );
  };

  // If there are no upcoming tasks
  if (upcomingTasks.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 font-heading">Upcoming Tasks</h2>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500 mb-4">No upcoming tasks scheduled.</p>
          <Button>Add a Task</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 font-heading">Upcoming Tasks</h2>
        <Link href="/upcoming">
          <a className="text-primary-500 text-sm font-medium flex items-center">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </Link>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {tomorrowTasks.slice(0, 3).map(renderTaskCard)}
        {nextFewDaysTasks.slice(0, 3 - tomorrowTasks.length).map(renderTaskCard)}
      </div>
    </div>
  );
}
