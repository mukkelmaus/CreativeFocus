import { TaskHistory, Task } from "@shared/schema";
import { CheckCircle, Edit, PlusCircle } from "lucide-react";
import { format } from "date-fns";

interface HistoryItemProps {
  history: TaskHistory;
  task?: Task;
}

export function HistoryItem({ history, task }: HistoryItemProps) {
  // Format the timestamp
  const formattedTime = history.timestamp ? format(new Date(history.timestamp), "h:mm a") : "";
  const formattedDate = history.timestamp ? format(new Date(history.timestamp), "MMM d, yyyy") : "Unknown date";
  
  // Get the appropriate icon and color based on action
  const getActionDetails = () => {
    switch (history.action) {
      case "completed":
        return { 
          icon: <CheckCircle className="h-5 w-5 text-success" />,
          bgColor: "bg-green-100",
          text: `Completed: ${task?.title || "Unknown task"}`,
          textColor: "text-success"
        };
      case "updated":
        return { 
          icon: <Edit className="h-5 w-5 text-primary-500" />,
          bgColor: "bg-blue-100",
          text: `Updated: ${task?.title || "Unknown task"}`,
          textColor: "text-primary-500"
        };
      case "created":
        return { 
          icon: <PlusCircle className="h-5 w-5 text-secondary-500" />,
          bgColor: "bg-purple-100",
          text: `Created: ${task?.title || "Unknown task"}`,
          textColor: "text-secondary-500"
        };
      default:
        return { 
          icon: <Edit className="h-5 w-5 text-gray-500" />,
          bgColor: "bg-gray-100",
          text: `${history.action}: ${task?.title || "Unknown task"}`,
          textColor: "text-gray-500"
        };
    }
  };
  
  const { icon, bgColor, text, textColor } = getActionDetails();

  return (
    <li className="p-4 hover:bg-gray-50">
      <div className="flex items-center">
        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${bgColor} flex items-center justify-center`}>
          {icon}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">{text}</p>
          <p className="text-sm text-gray-500">{formattedDate} at {formattedTime}</p>
        </div>
      </div>
    </li>
  );
}
