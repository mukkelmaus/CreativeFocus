import React from "react";
import { useTaskContext } from "@/context/taskContext";
import { useTaskActions } from "@/hooks/useTaskActions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  CheckCircle, 
  SkipForward, 
  CenterFocusStrong,
} from "lucide-react";

const FocusMode: React.FC = () => {
  const { focusTask, tasks } = useTaskContext();
  const { handleCompleteTask, handleSkipFocusTask, isSubmitting } = useTaskActions();

  if (!focusTask) {
    return null;
  }

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
    if (!focusTask.dueDate) return null;
    
    const dueDate = new Date(focusTask.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate.getTime() === today.getTime()) {
      return "Due Today";
    } else if (dueDate < today) {
      return "Overdue";
    } else {
      return `Due ${format(dueDate, 'MMM d')}`;
    }
  };

  const markAsDone = async () => {
    await handleCompleteTask(focusTask.id);
    handleSkipFocusTask(focusTask, tasks);
  };

  const skipTask = () => {
    handleSkipFocusTask(focusTask, tasks);
  };

  return (
    <Card className="bg-white dark:bg-neutral-800 shadow rounded-lg overflow-hidden mb-8 p-0 border-l-4 border-primary focus-task">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <CenterFocusStrong className="text-primary mr-2 h-5 w-5" />
              <h2 className="text-lg font-medium text-neutral-500 dark:text-neutral-200">Focus Mode</h2>
            </div>
            <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-400">Complete this task before moving to the next one:</p>
            <h3 className="text-xl font-semibold mt-3 text-neutral-500 dark:text-neutral-200">{focusTask.title}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className={getPriorityBadgeStyles(focusTask.priority)}>
                {focusTask.priority.charAt(0).toUpperCase() + focusTask.priority.slice(1)} Priority
              </Badge>
              {focusTask.dueDate && (
                <Badge variant="outline" className="bg-warning bg-opacity-10 text-warning dark:bg-opacity-20">
                  {getDueDateLabel()}
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button 
              variant="outline" 
              className="border-neutral-200 dark:border-neutral-700 dark:text-neutral-300"
              onClick={markAsDone}
              disabled={isSubmitting}
            >
              <CheckCircle className="mr-1 h-4 w-4 text-success" />
              Done
            </Button>
            <Button 
              variant="outline" 
              className="border-neutral-200 dark:border-neutral-700 dark:text-neutral-300"
              onClick={skipTask}
            >
              <SkipForward className="mr-1 h-4 w-4 text-neutral-400" />
              Skip
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FocusMode;
