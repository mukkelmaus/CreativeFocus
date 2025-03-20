import React, { useState } from "react";
import { useTaskContext } from "@/context/taskContext";
import TaskCard from "./task-card";
import { TaskWithOptionalValues, SortOption, TASK_STATUS } from "@/lib/types";
import { useTaskActions } from "@/hooks/useTaskActions";

interface TaskListProps {
  showCompleted?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ showCompleted = false }) => {
  const { tasks, sortBy } = useTaskContext();
  const { handleUpdateTask } = useTaskActions();
  const [draggedTask, setDraggedTask] = useState<TaskWithOptionalValues | null>(null);

  // Filter tasks by status
  const filteredTasks = tasks.filter(task => {
    if (showCompleted) {
      return task.status === TASK_STATUS.COMPLETED;
    } else {
      return task.status !== TASK_STATUS.COMPLETED;
    }
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        // Priority: high -> medium -> low
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      
      case 'dueDate':
        // Due date: earliest -> latest, null at the end
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      
      case 'created':
        // Created date: newest -> oldest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      
      case 'alphabetical':
        // Alphabetical: A -> Z
        return a.title.localeCompare(b.title);
      
      default:
        return 0;
    }
  });

  // Handle drag events
  const handleDragStart = (e: React.DragEvent, task: TaskWithOptionalValues) => {
    setDraggedTask(task);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.id === targetId) {
      return;
    }
    
    // Get target task details
    const targetTask = tasks.find(t => t.id === targetId);
    
    if (targetTask) {
      // Update position based on target position
      await handleUpdateTask(draggedTask.id, {
        position: targetTask.position
      });
    }
  };

  return (
    <div className="space-y-4" onDragOver={handleDragOver}>
      {sortedTasks.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-md p-8 text-center shadow-sm">
          <h3 className="text-lg font-medium text-neutral-500 dark:text-neutral-300 mb-2">
            {showCompleted ? "No completed tasks" : "No tasks found"}
          </h3>
          <p className="text-neutral-400 dark:text-neutral-400">
            {showCompleted 
              ? "Once you complete tasks, they will appear here."
              : "Add a new task to get started."}
          </p>
        </div>
      ) : (
        sortedTasks.map((task) => (
          <div 
            key={task.id} 
            onDragOver={(e) => handleDragOver(e)}
            onDrop={(e) => handleDrop(e, task.id)}
          >
            <TaskCard 
              task={task} 
              draggable={true}
              onDragStart={handleDragStart}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default TaskList;
