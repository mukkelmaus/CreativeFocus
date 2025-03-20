import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { TaskHistory } from "@/lib/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  History as HistoryIcon, 
  Check, 
  Edit, 
  Plus, 
  Trash 
} from "lucide-react";

const HistoryPage: React.FC = () => {
  // Fetch task history
  const { data: history = [], isLoading } = useQuery<TaskHistory[]>({
    queryKey: ['/api/history'],
  });

  // Helper to get icon for action
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="h-4 w-4 text-primary" />;
      case 'updated':
        return <Edit className="h-4 w-4 text-info" />;
      case 'completed':
        return <Check className="h-4 w-4 text-success" />;
      case 'deleted':
        return <Trash className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  // Helper to get badge for priority
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-primary-light bg-opacity-10 text-primary-light">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-info bg-opacity-10 text-info">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-neutral-300 bg-opacity-10 text-neutral-400">Low</Badge>;
      default:
        return null;
    }
  };

  // Helper to format date
  const formatDateTime = (dateString: string | Date) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-8">
        <HistoryIcon className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-semibold text-neutral-500 dark:text-neutral-200">Task History</h1>
      </div>

      <Card className="bg-white dark:bg-neutral-800 shadow">
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-700">
          <CardTitle className="text-xl font-medium text-neutral-500 dark:text-neutral-200">Activity Log</CardTitle>
          <CardDescription>A record of all your task activities and changes</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">
              <p className="text-neutral-400 dark:text-neutral-400">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-neutral-400 dark:text-neutral-400">No history records found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="flex items-center">
                      {getActionIcon(record.action)}
                      <span className="ml-2 capitalize">{record.action}</span>
                    </TableCell>
                    <TableCell className="font-medium">{record.title}</TableCell>
                    <TableCell>{getPriorityBadge(record.priority)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        record.status === 'completed' 
                          ? 'bg-success bg-opacity-10 text-success' 
                          : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300'
                      }>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(record.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;
