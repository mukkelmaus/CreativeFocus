import React, { useState } from "react";
import { useTaskContext } from "@/context/taskContext";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskWithOptionalValues } from "@/lib/types";
import TaskCard from "@/components/tasks/task-card";
import { format } from "date-fns";
import { CalendarDays, CheckCircle2 } from "lucide-react";

const CalendarPage: React.FC = () => {
  const { tasks } = useTaskContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState("day");

  // Group tasks by date for the calendar view
  const tasksByDate: Record<string, TaskWithOptionalValues[]> = {};

  // Only include tasks with due dates
  tasks.filter(task => task.dueDate).forEach(task => {
    const dueDate = new Date(task.dueDate as string);
    const dateKey = format(dueDate, 'yyyy-MM-dd');
    
    if (!tasksByDate[dateKey]) {
      tasksByDate[dateKey] = [];
    }
    
    tasksByDate[dateKey].push(task);
  });

  // Get tasks for the selected date
  const getTasksForSelectedDate = () => {
    if (!selectedDate) return [];
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return tasksByDate[dateKey] || [];
  };

  // Get tasks for the selected month
  const getTasksForSelectedMonth = () => {
    if (!selectedDate) return [];
    
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate.getFullYear() === year && dueDate.getMonth() === month;
    });
  };

  // Get day view content
  const dayContent = () => {
    const tasksForDay = getTasksForSelectedDate();
    
    if (tasksForDay.length === 0) {
      return (
        <div className="text-center py-8">
          <CheckCircle2 className="h-10 w-10 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-500 dark:text-neutral-300">No tasks for this day</h3>
          <p className="text-neutral-400 dark:text-neutral-400">
            Select a different day or add a new task with this due date.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 mt-4">
        <h3 className="text-lg font-medium text-neutral-500 dark:text-neutral-200">
          Tasks due on {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        {tasksForDay.map(task => (
          <TaskCard key={task.id} task={task} draggable={false} />
        ))}
      </div>
    );
  };

  // Get month view content
  const monthContent = () => {
    const tasksForMonth = getTasksForSelectedMonth();
    
    if (tasksForMonth.length === 0) {
      return (
        <div className="text-center py-8">
          <CheckCircle2 className="h-10 w-10 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-500 dark:text-neutral-300">No tasks for this month</h3>
          <p className="text-neutral-400 dark:text-neutral-400">
            Select a different month or add new tasks with due dates.
          </p>
        </div>
      );
    }
    
    // Group tasks by day
    const groupedTasks: Record<string, TaskWithOptionalValues[]> = {};
    
    tasksForMonth.forEach(task => {
      const dueDate = new Date(task.dueDate as string);
      const day = dueDate.getDate();
      
      if (!groupedTasks[day]) {
        groupedTasks[day] = [];
      }
      
      groupedTasks[day].push(task);
    });
    
    return (
      <div className="space-y-6 mt-4">
        <h3 className="text-lg font-medium text-neutral-500 dark:text-neutral-200">
          Tasks for {format(selectedDate, 'MMMM yyyy')}
        </h3>
        
        {Object.entries(groupedTasks).map(([day, dayTasks]) => (
          <div key={day} className="space-y-2">
            <h4 className="text-md font-medium text-neutral-500 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700 pb-2">
              {format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), parseInt(day)), 'MMMM d, yyyy')}
            </h4>
            {dayTasks.map(task => (
              <TaskCard key={task.id} task={task} draggable={false} />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-8">
        <CalendarDays className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-semibold text-neutral-500 dark:text-neutral-200">Calendar</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-4 bg-white dark:bg-neutral-800 shadow">
          <CardContent className="p-4">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              initialFocus
            />
          </CardContent>
        </Card>

        <div className="md:col-span-8">
          <Tabs defaultValue="day" value={view} onValueChange={setView}>
            <TabsList className="mb-4">
              <TabsTrigger value="day">Day View</TabsTrigger>
              <TabsTrigger value="month">Month View</TabsTrigger>
            </TabsList>
            <TabsContent value="day" className="space-y-4">
              <Card className="bg-white dark:bg-neutral-800 shadow">
                <CardContent className="p-6">
                  {dayContent()}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="month" className="space-y-4">
              <Card className="bg-white dark:bg-neutral-800 shadow">
                <CardContent className="p-6">
                  {monthContent()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
