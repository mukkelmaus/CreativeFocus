import React from "react";
import { TaskWithOptionalValues } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MoreVertical, 
  Paperclip, 
  MessageCircle, 
  CheckCircle,
  Circle
} from "lucide-react";
import { format } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTaskActions } from "@/hooks/useTaskActions";

interface TaskCardProps {
  task: TaskWithOptionalValues;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, task: TaskWithOptionalValues) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  draggable = true,
  onDragStart
}) => {
  const { handleCompleteTask, handleDeleteTask, isSubmitting } = useTaskActions();

  const getPriorityBadgeStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return "bg-primary-light bg-opacity-10 text-primary-light dark:bg-opacity-20";
      case 'medium':
        return "bg-info bg-opacity-10 text-info dark:bg-opacity-20";
      case 'low':
        return "bg-neutral-300 bg-opacity-10 text-neutral-400 dark:bg-opacity-20";
      default:
        return "bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300";
    }
  };

  const getDueDateLabel = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDate.getTime() === today.getTime()) {
      return (
        <Badge variant="outline" className="bg-warning bg-opacity-10 text-warning dark:bg-opacity-20">
          Due Today
        </Badge>
      );
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      return (
        <Badge variant="outline" className="bg-warning bg-opacity-10 text-warning dark:bg-opacity-20">
          Due Tomorrow
        </Badge>
      );
    } else if (dueDate < today) {
      return (
        <Badge variant="outline" className="bg-destructive bg-opacity-10 text-destructive dark:bg-opacity-20">
          Overdue
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300">
          Due {format(dueDate, 'MMM d')}
        </Badge>
      );
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, task);
    }
  };

  return (
    <Card 
      className={`task-card bg-white dark:bg-neutral-800 shadow hover:shadow-md transition-all duration-200 dark:shadow-neutral-900`}
      draggable={draggable}
      onDragStart={handleDragStart}
      data-task-id={task.id}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Button 
              variant="outline" 
              size="icon" 
              className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full border-2 border-primary p-0 hover:bg-primary-light hover:bg-opacity-10" 
              onClick={() => handleCompleteTask(task.id)}
              disabled={isSubmitting}
            >
              {task.status === 'completed' ? <CheckCircle className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-transparent" />}
            </Button>
            <div>
              <h3 className="text-lg font-medium text-neutral-500 dark:text-neutral-200">{task.title}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className={getPriorityBadgeStyles(task.priority)}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </Badge>
                {getDueDateLabel()}
                {task.workspace && (
                  <Badge variant="outline" className="bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300">
                    {task.workspace}
                  </Badge>
                )}
              </div>
              {task.description && (
                <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-400">{task.description}</p>
              )}
              {task.dueDate && (
                <div className="mt-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <span className="text-xs text-neutral-400">
                      {format(new Date(task.dueDate), 'PPp')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-shrink-0 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-300">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleCompleteTask(task.id)}>
                  Mark as Complete
                </DropdownMenuItem>
                <DropdownMenuItem>Edit Task</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex -space-x-1 overflow-hidden">
              <div className="inline-block h-6 w-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium ring-2 ring-white dark:ring-neutral-800">
                <span>AJ</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-300">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-300">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
