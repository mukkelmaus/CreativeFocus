import { useTasks } from "@/hooks/use-tasks";
import { useCategories } from "@/hooks/use-categories";
import { FocusedBanner } from "@/components/layout/focused-banner";
import { AiSuggestion } from "@/components/layout/ai-suggestion";
import { TaskList } from "@/components/ui/task-list";
import { Skeleton } from "@/components/ui/skeleton";
import { SummarySection } from "@/components/dashboard/summary-section";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskBreakdown } from "@/lib/types";
import { Loader2, CheckCircle2 } from "lucide-react";
import { isToday } from "date-fns";
import { TaskWithCategory } from "@/lib/types";

interface DashboardProps {
  onEditTask?: (task: TaskWithCategory) => void;
}

export default function Dashboard({ onEditTask }: DashboardProps) {
  const { tasks, isLoading, getTaskBreakdown, addTask } = useTasks();
  const { categories } = useCategories();
  const [taskBreakdownId, setTaskBreakdownId] = useState<number | null>(null);
  const [taskBreakdown, setTaskBreakdown] = useState<TaskBreakdown | null>(null);
  const [showBreakdownResult, setShowBreakdownResult] = useState(false);
  
  // Combine tasks with their categories
  const tasksWithCategories = tasks.map(task => ({
    ...task,
    category: categories.find(cat => cat.id === task.categoryId)
  }));

  // Filter today's tasks
  const todayTasks = tasksWithCategories.filter(task => {
    if (!task.dueDate) return false;
    return isToday(new Date(task.dueDate));
  });

  // Handle task breakdown
  const handleTaskBreakdown = async (taskId: number) => {
    setTaskBreakdownId(taskId);
    setTaskBreakdown(null);
    setShowBreakdownResult(false);
    
    // Get the task breakdown
    const taskToBreakdown = tasksWithCategories.find(t => t.id === taskId);
    if (!taskToBreakdown) return;
    
    try {
      const response = await fetch(`/api/ai/task-breakdown/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTaskBreakdown(data);
        setShowBreakdownResult(true);
      }
    } catch (error) {
      console.error("Error getting task breakdown:", error);
    }
  };

  // Handle applying the task breakdown
  const handleApplyBreakdown = async () => {
    if (!taskBreakdown || !taskBreakdownId) return;
    
    const parentTask = tasksWithCategories.find(t => t.id === taskBreakdownId);
    if (!parentTask) return;
    
    // Create subtasks from the breakdown
    for (const subtask of taskBreakdown.subtasks) {
      await addTask.mutateAsync({
        title: subtask.title,
        description: subtask.description,
        priority: subtask.priority,
        categoryId: parentTask.categoryId,
        parentTaskId: taskBreakdownId,
        aiGenerated: true,
        status: "todo",
        completed: false,
      });
    }
    
    setTaskBreakdownId(null);
    setTaskBreakdown(null);
    setShowBreakdownResult(false);
  };

  // Show loading skeleton if data is loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-[100px] bg-white rounded-lg animate-pulse" />
        <div className="h-[200px] bg-white rounded-lg animate-pulse" />
        <div className="h-[400px] bg-white rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <SummarySection tasks={tasksWithCategories} />
      
      <FocusedBanner />
      
      <AiSuggestion />
      
      <TaskList 
        title="Today's Tasks" 
        onBreakdown={handleTaskBreakdown}
        onEditTask={onEditTask || (() => {})}
      />
      
      <UpcomingTasks 
        tasks={tasksWithCategories}
        onEditTask={onEditTask || (() => {})}
      />
      
      {/* Task Breakdown Loading Dialog */}
      <Dialog open={!!taskBreakdownId && !showBreakdownResult} onOpenChange={() => {
        setTaskBreakdownId(null);
        setShowBreakdownResult(false);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Task Breakdown</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-10 w-10 animate-spin text-primary-500 mb-4" />
            <p className="text-center text-gray-600">
              AI is analyzing this task to help break it down into manageable steps.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Task Breakdown Results Dialog */}
      <Dialog open={!!taskBreakdownId && showBreakdownResult} onOpenChange={() => {
        setTaskBreakdownId(null);
        setShowBreakdownResult(false);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Task Breakdown</DialogTitle>
          </DialogHeader>
          {taskBreakdown && (
            <div className="py-3">
              <p className="text-sm text-gray-600 mb-4">
                Here's how you can break down this task into smaller, manageable steps:
              </p>
              <div className="space-y-3 mb-4">
                {taskBreakdown.subtasks.map((subtask, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium">{subtask.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{subtask.description}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            subtask.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            subtask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {subtask.priority.charAt(0).toUpperCase() + subtask.priority.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ~{subtask.estimatedDuration} mins
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setTaskBreakdownId(null);
              setShowBreakdownResult(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleApplyBreakdown}>
              Apply Breakdown
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
