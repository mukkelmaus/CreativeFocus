import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { HistoryItem } from "@/components/task-history/history-item";
import { useTasks } from "@/hooks/use-tasks";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

export default function TaskHistory() {
  const [timeframe, setTimeframe] = useState<string>("all");
  const { tasks } = useTasks();
  
  // Fetch task history from API
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["/api/task-history"],
  });

  // Filter history by timeframe if needed
  const filteredHistory = history.filter(item => {
    if (timeframe === "all") return true;
    
    const itemDate = new Date(item.timestamp);
    const now = new Date();
    
    switch (timeframe) {
      case "today":
        return itemDate.toDateString() === now.toDateString();
      case "week":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return itemDate >= oneWeekAgo;
      case "month":
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return itemDate >= oneMonthAgo;
      default:
        return true;
    }
  });

  // Show loading skeleton if data is loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Task History</h1>
          <p className="text-gray-500">Track your task completion and activity over time.</p>
        </div>
        
        <div className="w-48">
          <Label htmlFor="timeframe-filter" className="mb-2 block">Filter by</Label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger id="timeframe-filter">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {filteredHistory.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredHistory.map(item => (
                <HistoryItem 
                  key={item.id}
                  history={item}
                  task={tasks.find(t => t.id === item.taskId)}
                />
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500">No task history found for this timeframe.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
