import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCategories } from '@/hooks/use-categories';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  History,
  Cloud,
  Settings,
  HelpCircle,
  ChevronDown,
  X,
  Menu,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { categories } = useCategories();
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);

  const navItems = [
    { href: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', section: 'main' },
    { href: '/today', icon: <Calendar size={18} />, label: 'Today', section: 'main' },
    { href: '/upcoming', icon: <Clock size={18} />, label: 'Upcoming', section: 'main' },
    { href: '/history', icon: <History size={18} />, label: 'History', section: 'main' },
    { href: '/calendar', icon: <Calendar size={18} />, label: 'Calendar', section: 'integrations' },
    { href: '/services', icon: <Cloud size={18} />, label: 'Services', section: 'integrations' },
    { href: '/settings', icon: <Settings size={18} />, label: 'Settings', section: 'footer' },
    { href: '/help', icon: <HelpCircle size={18} />, label: 'Help Center', section: 'footer' },
  ];

  // Filter navigation items by section
  const getNavItemsBySection = (section: string) => {
    return navItems.filter(item => item.section === section);
  };

  const mainNavItems = getNavItemsBySection('main');
  const integrationNavItems = getNavItemsBySection('integrations');
  const footerNavItems = getNavItemsBySection('footer');

  // Sidebar classes based on open state
  const sidebarClasses = `fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  } md:translate-x-0 md:static md:flex md:flex-col md:flex-shrink-0`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={sidebarClasses}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12L9 15M12 12L15 15M12 12V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="ml-2 text-xl font-semibold text-gray-800 font-heading">OneTask</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>
        
        <ScrollArea className="flex-grow">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Workspaces
          </div>
          
          <div className="px-4 py-2">
            <button 
              className="w-full flex items-center space-x-2 bg-gray-100 p-2 rounded-md"
              onClick={() => setWorkspaceExpanded(!workspaceExpanded)}
            >
              <div className="w-6 h-6 bg-primary-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">DU</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Personal</span>
              <ChevronDown size={16} className={`text-gray-400 ml-auto ${workspaceExpanded ? 'transform rotate-180' : ''}`} />
            </button>
          </div>
          
          {workspaceExpanded && (
            <nav className="mt-4">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main
              </div>
              
              {mainNavItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                >
                  <a
                    className={`flex items-center px-4 py-3 text-sm font-medium ${
                      location === item.href
                        ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`mr-3 ${location === item.href ? 'text-primary-500' : 'text-gray-500'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </a>
                </Link>
              ))}
              
              <div className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Categories
              </div>
              
              {categories.map((category) => (
                <Link 
                  key={category.id}
                  href={`/category/${category.id}`}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                >
                  <a className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </a>
                </Link>
              ))}
              
              <div className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Integrations
              </div>
              
              {integrationNavItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                >
                  <a
                    className={`flex items-center px-4 py-3 text-sm font-medium ${
                      location === item.href
                        ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`mr-3 ${location === item.href ? 'text-primary-500' : 'text-gray-500'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t border-gray-200">
          {footerNavItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
            >
              <a className="flex items-center mt-3 text-sm font-medium text-gray-600 hover:text-primary-500">
                <span className="mr-3 text-gray-500">{item.icon}</span>
                {item.label}
              </a>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Mobile Toggle Button - only visible outside sidebar */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-6 left-6 w-12 h-12 rounded-full bg-white shadow-lg z-40 md:hidden"
        onClick={() => onClose()}
      >
        <Menu size={24} />
      </Button>
    </>
  );
}
