import { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash, SplitSquareVertical } from "lucide-react";
import { format } from 'date-fns';
import { TaskWithCategory } from '@/lib/types';
import { TaskPriority } from '@shared/schema';

interface TaskCardProps {
  task: TaskWithCategory;
  onComplete: (id: number) => void;
  onEdit: (task: TaskWithCategory) => void;
  onDelete: (id: number) => void;
  onBreakdown?: (id: number) => void;
  viewType?: 'list' | 'card' | 'kanban';
}

export function TaskCard({ 
  task, 
  onComplete, 
  onEdit, 
  onDelete, 
  onBreakdown,
  viewType = 'list' 
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return { border: "border-l-4 border-l-red-500", badge: "bg-red-100 text-red-800" };
      case TaskPriority.MEDIUM:
        return { border: "border-l-4 border-l-amber-500", badge: "bg-yellow-100 text-yellow-800" };
      case TaskPriority.LOW:
        return { border: "border-l-4 border-l-green-500", badge: "bg-green-100 text-green-800" };
      default:
        return { border: "", badge: "bg-gray-100 text-gray-800" };
    }
  };

  const priorityColors = getPriorityColor(task.priority);
  const categoryColor = task.category?.color || "#4338ca";
  
  // Format due date string
  const getDueDateString = () => {
    if (!task.dueDate) return "";
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (dueDate.toDateString() === today.toDateString()) {
      return `Today at ${format(dueDate, 'h:mm a')}`;
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${format(dueDate, 'h:mm a')}`;
    } else {
      return format(dueDate, 'MMM d') + " at " + format(dueDate, 'h:mm a');
    }
  };

  // Render list view (default)
  if (viewType === 'list') {
    return (
      <div 
        className={`task-card bg-white rounded-lg shadow-sm p-4 ${priorityColors.border} flex items-start mb-3 hover:shadow-md transition-shadow`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => {
            if (!task.completed) onComplete(task.id);
          }}
          className="mt-1 h-5 w-5"
        />
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {task.title}
            </h3>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={priorityColors.badge}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
              {task.dueDate && (
                <span className="text-sm text-gray-500">{getDueDateString()}</span>
              )}
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center">
              <span className="inline-block w-6 h-6 rounded-full bg-primary-400 flex items-center justify-center text-xs text-white font-medium">
                {task.category?.name?.charAt(0) || 'T'}
              </span>
              <span 
                className="inline-block w-3 h-3 rounded-full ml-2 mr-1" 
                style={{ backgroundColor: categoryColor }}
              />
              <span className="text-xs text-gray-500">{task.category?.name || 'No Category'}</span>
            </div>
            
            {isHovered && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <MoreVertical size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit size={14} className="mr-2" /> Edit
                  </DropdownMenuItem>
                  {onBreakdown && (
                    <DropdownMenuItem onClick={() => onBreakdown(task.id)}>
                      <SplitSquareVertical size={14} className="mr-2" /> Break Down
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                    <Trash size={14} className="mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render card view
  if (viewType === 'card') {
    return (
      <div 
        className="task-card bg-white rounded-lg shadow-sm p-4 border-t-4 hover:shadow-md transition-shadow"
        style={{ borderTopColor: categoryColor }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">{getDueDateString() || 'No due date'}</span>
          <Badge variant="outline" className={priorityColors.badge}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
        </div>
        <h3 className={`text-base font-medium mb-2 ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
          {task.title}
        </h3>
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
              style={{ backgroundColor: categoryColor }}
            />
            <span className="text-xs text-gray-500">{task.category?.name || 'No Category'}</span>
          </div>
          
          {isHovered && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-400 hover:text-gray-500 focus:outline-none">
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onComplete(task.id)}>
                  <Checkbox checked={task.completed} className="mr-2" /> Complete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit size={14} className="mr-2" /> Edit
                </DropdownMenuItem>
                {onBreakdown && (
                  <DropdownMenuItem onClick={() => onBreakdown(task.id)}>
                    <SplitSquareVertical size={14} className="mr-2" /> Break Down
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                  <Trash size={14} className="mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  }

  // Kanban view
  return (
    <div 
      className="task-card bg-white rounded-lg shadow-sm p-4 mb-3 hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className={priorityColors.badge}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </Badge>
        {isHovered && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-gray-500 focus:outline-none">
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onComplete(task.id)}>
                <Checkbox checked={task.completed} className="mr-2" /> Complete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit size={14} className="mr-2" /> Edit
              </DropdownMenuItem>
              {onBreakdown && (
                <DropdownMenuItem onClick={() => onBreakdown(task.id)}>
                  <SplitSquareVertical size={14} className="mr-2" /> Break Down
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                <Trash size={14} className="mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <h3 className="text-base font-medium text-gray-800 mb-1">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center">
          <span 
            className="inline-block w-3 h-3 rounded-full mr-1" 
            style={{ backgroundColor: categoryColor }}
          />
          <span className="text-xs text-gray-500">{task.category?.name || 'No Category'}</span>
        </div>
        {task.dueDate && (
          <span className="text-xs text-gray-500">{format(new Date(task.dueDate), 'MMM d')}</span>
        )}
      </div>
    </div>
  );
}
