import React, { useState } from "react";
import { useThemeContext } from "@/context/themeContext";
import { useTaskContext } from "@/context/taskContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Menu,
  CenterFocusStrong, 
  DarkMode, 
  LightMode,
  Notifications, 
  AccountCircle
} from "lucide-react";

interface TopBarProps {}

const TopBar: React.FC<TopBarProps> = () => {
  const { theme, toggleTheme } = useThemeContext();
  const { toggleAiSection } = useTaskContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-neutral-800 shadow dark:shadow-neutral-900">
      <button 
        type="button" 
        className="md:hidden px-4 text-neutral-400 dark:text-neutral-300"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <label htmlFor="search-field" className="sr-only">Search</label>
            <div className="relative w-full text-neutral-400 focus-within:text-neutral-500 dark:text-neutral-400 dark:focus-within:text-neutral-300">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <Search className="h-5 w-5 ml-3" />
              </div>
              <Input
                id="search-field"
                className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-neutral-500 placeholder-neutral-300 focus:outline-none focus:ring-0 focus:placeholder-neutral-400 focus:border-transparent sm:text-sm bg-neutral-100 dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400 rounded-md"
                placeholder="Search tasks..."
                type="search"
                name="search"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-neutral-500 dark:text-neutral-300 dark:hover:text-neutral-200"
            onClick={() => toggleAiSection()}
          >
            <CenterFocusStrong className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-neutral-500 dark:text-neutral-300 dark:hover:text-neutral-200"
            onClick={toggleTheme}
          >
            {theme.mode === 'dark' ? (
              <LightMode className="h-5 w-5" />
            ) : (
              <DarkMode className="h-5 w-5" />
            )}
          </Button>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-neutral-500 dark:text-neutral-300 dark:hover:text-neutral-200"
            >
              <Notifications className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error"></span>
            </Button>
          </div>
          
          <div className="ml-3 relative">
            <Button
              variant="ghost"
              size="icon"
              className="max-w-xs flex items-center text-sm rounded-full text-neutral-400 hover:text-neutral-500 dark:text-neutral-300 dark:hover:text-neutral-200 focus:outline-none"
              id="user-menu"
              aria-haspopup="true"
            >
              <AccountCircle className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
