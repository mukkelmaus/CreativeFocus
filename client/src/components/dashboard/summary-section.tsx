import { Card, CardContent } from "@/components/ui/card";
import { TaskPriority, TaskStatus } from "@shared/schema";
import { TaskWithCategory } from "@/lib/types";
import { CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";
import { format, isToday } from "date-fns";

interface SummarySectionProps {
  tasks: TaskWithCategory[];
}

export function SummarySection({ tasks }: SummarySectionProps) {
  // Calculate summary metrics
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    return isToday(new Date(task.dueDate));
  });
  
  const completedToday = tasks.filter(task => 
    task.status === TaskStatus.COMPLETED && 
    task.completedAt && 
    isToday(new Date(task.completedAt))
  );
  
  const overdueTasksCount = tasks.filter(task => {
    if (task.status === TaskStatus.COMPLETED) return false;
    if (!task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    
    return dueDate < now;
  }).length;
  
  const upcomingTasksCount = tasks.filter(task => {
    if (task.status === TaskStatus.COMPLETED) return false;
    if (!task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return dueDate > today;
  }).length;
  
  // Get current date display
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");

  return (
    <div className="mb-8">
      <div className="mb-4">
        <p className="text-gray-500">{formattedDate}</p>
        <h1 className="text-3xl font-bold text-gray-800 font-heading">Welcome back</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Tasks</p>
              <p className="text-2xl font-bold">{todayTasks.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Today</p>
              <p className="text-2xl font-bold">{completedToday.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-red-100 p-3 mr-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Overdue Tasks</p>
              <p className="text-2xl font-bold">{overdueTasksCount}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming Tasks</p>
              <p className="text-2xl font-bold">{upcomingTasksCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
