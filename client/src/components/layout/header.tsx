import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  Plus, 
  Filter, 
  Maximize, 
  Brain, 
  Bell, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings, 
  HelpCircle 
} from 'lucide-react';
import { useFocusMode } from '@/hooks/use-focus-mode';
import { FocusModeModal } from '../modals/focus-mode-modal';
import { ThemeModal } from '../modals/theme-modal';
import { NewTaskModal } from '../modals/new-task-modal';
import { TaskWithCategory } from '@/lib/types';

interface HeaderProps {
  title: string;
  onOpenSidebar: () => void;
  onAddTask?: (task: TaskWithCategory) => void;
}

export function Header({ title, onOpenSidebar, onAddTask }: HeaderProps) {
  const { isFocusModeEnabled, enableFocusMode, disableFocusMode } = useFocusMode();
  const [isFocusModeModalOpen, setIsFocusModeModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const handleAddTask = (task: TaskWithCategory) => {
    if (onAddTask) {
      onAddTask(task);
    }
    setIsNewTaskModalOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center lg:hidden">
          <Button variant="ghost" size="icon" onClick={onOpenSidebar}>
            <Menu size={24} />
          </Button>
          <div className="ml-2 w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center lg:hidden">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12L9 15M12 12L15 15M12 12V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        <div className="hidden md:flex items-center">
          <Button 
            className="bg-primary-500 text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-primary-600 transition"
            onClick={() => setIsNewTaskModalOpen(true)}
          >
            <Plus size={16} className="mr-2" />
            New Task
          </Button>
          <Button variant="outline" className="ml-3">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
        
        <div className="flex items-center">
          <div className="relative mx-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                if (isFocusModeEnabled) {
                  disableFocusMode();
                } else {
                  setIsFocusModeModalOpen(true);
                }
              }}
              className={isFocusModeEnabled ? "bg-primary-100 text-primary-700" : ""}
              title="Toggle Focus Mode"
            >
              <Maximize size={20} />
            </Button>
          </div>
          <div className="relative mx-2">
            <Button 
              variant="ghost" 
              size="icon" 
              title="AI Assistant"
            >
              <Brain size={20} />
            </Button>
          </div>
          <div className="relative mx-2">
            <Button 
              variant="ghost" 
              size="icon" 
              title="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
            </Button>
          </div>
          
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <img
                  src="https://github.com/shadcn.png"
                  alt="User"
                  className="rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsThemeModalOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="border-b border-gray-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800 font-heading">{title}</h1>
        </div>
      </div>

      {/* Modals */}
      <FocusModeModal 
        isOpen={isFocusModeModalOpen} 
        onClose={() => setIsFocusModeModalOpen(false)} 
        onEnable={enableFocusMode}
      />
      
      <ThemeModal 
        isOpen={isThemeModalOpen} 
        onClose={() => setIsThemeModalOpen(false)} 
      />
      
      <NewTaskModal 
        isOpen={isNewTaskModalOpen} 
        onClose={() => setIsNewTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </header>
  );
}
