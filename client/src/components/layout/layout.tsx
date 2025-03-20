import { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { TaskWithCategory } from "@/lib/types";
import { NewTaskModal } from "../modals/new-task-modal";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithCategory | undefined>(undefined);

  // Get the current page title based on the route
  const getPageTitle = () => {
    switch (true) {
      case location === "/":
        return "Dashboard";
      case location === "/today":
        return "Today's Tasks";
      case location === "/upcoming":
        return "Upcoming Tasks";
      case location === "/history":
        return "Task History";
      case location === "/settings":
        return "Settings";
      case location.startsWith("/category/"):
        return "Category Tasks";
      default:
        return "OneTask";
    }
  };

  const handleAddTask = (task: TaskWithCategory) => {
    setIsNewTaskModalOpen(false);
    setEditingTask(undefined);
  };

  const handleEditTask = (task: TaskWithCategory) => {
    setEditingTask(task);
    setIsNewTaskModalOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          title={getPageTitle()} 
          onOpenSidebar={() => setSidebarOpen(true)} 
          onAddTask={() => setIsNewTaskModalOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Pass the editTask handler to children that need it */}
            {React.cloneElement(children as React.ReactElement, { onEditTask: handleEditTask })}
          </div>
        </main>
      </div>

      {/* Mobile Add Task Button */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button 
          className="h-14 w-14 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg hover:bg-primary-600 transition"
          onClick={() => setIsNewTaskModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => {
          setIsNewTaskModalOpen(false);
          setEditingTask(undefined);
        }}
        onAddTask={handleAddTask}
        editTask={editingTask}
      />
    </div>
  );
}
