import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTaskContext } from "@/context/taskContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { TaskWithOptionalValues, TASK_PRIORITIES, TASK_STATUS } from "@/lib/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/separator";
import { startOfWeek, format, addDays, differenceInDays, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { ChartIcon, BarChart2, PieChart as PieChartIcon, Calendar, Clock } from "lucide-react";

const Analytics: React.FC = () => {
  const { tasks, aiInsights, refreshAiSuggestions } = useTaskContext();

  // Productivity stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === TASK_STATUS.COMPLETED).length;
  const pendingTasks = tasks.filter(task => task.status !== TASK_STATUS.COMPLETED).length;
  const highPriorityTasks = tasks.filter(task => task.priority === TASK_PRIORITIES.HIGH).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate task completion by day of week
  const getTasksByDayOfWeek = () => {
    const dayStats = [
      { name: 'Sun', completed: 0, pending: 0 },
      { name: 'Mon', completed: 0, pending: 0 },
      { name: 'Tue', completed: 0, pending: 0 },
      { name: 'Wed', completed: 0, pending: 0 },
      { name: 'Thu', completed: 0, pending: 0 },
      { name: 'Fri', completed: 0, pending: 0 },
      { name: 'Sat', completed: 0, pending: 0 }
    ];

    // Get completed tasks from the last 4 weeks
    const today = new Date();
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(today.getDate() - 28);

    tasks.forEach(task => {
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        
        // Check if the task was completed in the last 4 weeks
        if (completedDate >= fourWeeksAgo && completedDate <= today) {
          const dayOfWeek = completedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
          dayStats[dayOfWeek].completed++;
        }
      }
      
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const dayOfWeek = dueDate.getDay();
        
        if (task.status !== TASK_STATUS.COMPLETED) {
          dayStats[dayOfWeek].pending++;
        }
      }
    });

    return dayStats;
  };

  // Calculate task distribution by priority
  const getTasksByPriority = () => {
    return [
      { name: 'High', value: tasks.filter(task => task.priority === TASK_PRIORITIES.HIGH).length },
      { name: 'Medium', value: tasks.filter(task => task.priority === TASK_PRIORITIES.MEDIUM).length },
      { name: 'Low', value: tasks.filter(task => task.priority === TASK_PRIORITIES.LOW).length }
    ];
  };

  // Calculate task status distribution
  const getTasksByStatus = () => {
    return [
      { name: 'To Do', value: tasks.filter(task => task.status === TASK_STATUS.TODO).length },
      { name: 'In Progress', value: tasks.filter(task => task.status === TASK_STATUS.IN_PROGRESS).length },
      { name: 'Completed', value: tasks.filter(task => task.status === TASK_STATUS.COMPLETED).length }
    ];
  };

  // Calculate completion time (average days from creation to completion)
  const getAverageCompletionTime = () => {
    const completedTasks = tasks.filter(task => task.status === TASK_STATUS.COMPLETED && task.completedAt);
    
    if (completedTasks.length === 0) return 0;
    
    const totalDays = completedTasks.reduce((sum, task) => {
      const createdDate = new Date(task.createdAt);
      const completedDate = new Date(task.completedAt!);
      const days = Math.max(0, differenceInDays(completedDate, createdDate));
      return sum + days;
    }, 0);
    
    return Math.round((totalDays / completedTasks.length) * 10) / 10; // One decimal place
  };

  // Colors for charts
  const COLORS = {
    completed: 'var(--chart-1, #4caf50)',
    pending: 'var(--chart-2, #ff9800)',
    high: 'var(--chart-3, #f44336)',
    medium: 'var(--chart-4, #3f51b5)',
    low: 'var(--chart-5, #9e9e9e)',
    todo: '#ff9800',
    inProgress: '#2196f3',
    completed2: '#4caf50',
  };

  const PRIORITY_COLORS = [COLORS.high, COLORS.medium, COLORS.low];
  const STATUS_COLORS = [COLORS.todo, COLORS.inProgress, COLORS.completed2];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-8">
        <ChartIcon className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-semibold text-neutral-500 dark:text-neutral-200">Analytics</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white dark:bg-neutral-800 shadow">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-400 dark:text-neutral-400">Total Tasks</p>
                <h3 className="text-3xl font-bold text-neutral-500 dark:text-neutral-200 mt-1">{totalTasks}</h3>
              </div>
              <BarChart2 className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-800 shadow">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-400 dark:text-neutral-400">Completion Rate</p>
                <h3 className="text-3xl font-bold text-neutral-500 dark:text-neutral-200 mt-1">{completionRate}%</h3>
              </div>
              <PieChartIcon className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-800 shadow">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-400 dark:text-neutral-400">High Priority</p>
                <h3 className="text-3xl font-bold text-neutral-500 dark:text-neutral-200 mt-1">{highPriorityTasks}</h3>
              </div>
              <Calendar className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-800 shadow">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-400 dark:text-neutral-400">Avg. Completion Time</p>
                <h3 className="text-3xl font-bold text-neutral-500 dark:text-neutral-200 mt-1">{getAverageCompletionTime()} <span className="text-base font-normal">days</span></h3>
              </div>
              <Clock className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Completion Chart */}
        <Card className="bg-white dark:bg-neutral-800 shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-neutral-500 dark:text-neutral-200">Task Completion by Day</CardTitle>
            <CardDescription>Analysis of your task completion pattern over the last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getTasksByDayOfWeek()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" name="Completed" fill={COLORS.completed} />
                  <Bar dataKey="pending" stackId="a" name="Pending" fill={COLORS.pending} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Charts */}
        <Card className="bg-white dark:bg-neutral-800 shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-neutral-500 dark:text-neutral-200">Task Distribution</CardTitle>
            <CardDescription>Breakdown of tasks by priority and status</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-80 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-300 mb-4 text-center">By Priority</h4>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={getTasksByPriority()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getTasksByPriority().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-300 mb-4 text-center">By Status</h4>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={getTasksByStatus()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getTasksByStatus().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Card */}
      <Card className="bg-white dark:bg-neutral-800 shadow mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-neutral-500 dark:text-neutral-200">AI Productivity Insights</CardTitle>
          <CardDescription>AI-powered analysis of your task management patterns</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          {aiInsights ? (
            <div className="space-y-4">
              <div className="p-4 bg-primary bg-opacity-5 dark:bg-opacity-10 rounded-lg border border-primary border-opacity-20">
                <h4 className="font-medium text-primary mb-2">Insight</h4>
                <p className="text-neutral-600 dark:text-neutral-300">{aiInsights.insight}</p>
              </div>
              <div className="p-4 bg-info bg-opacity-5 dark:bg-opacity-10 rounded-lg border border-info border-opacity-20">
                <h4 className="font-medium text-info mb-2">Recommendation</h4>
                <p className="text-neutral-600 dark:text-neutral-300">{aiInsights.suggestion}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-400 dark:text-neutral-400">No AI insights available yet. Add and complete more tasks to receive personalized productivity analysis.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
