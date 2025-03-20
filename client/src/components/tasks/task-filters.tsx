import React from "react";
import { useTaskContext } from "@/context/taskContext";
import { SortOption, FilterOption } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const TaskFilters: React.FC = () => {
  const { 
    filterBy, 
    setFilterBy, 
    sortBy, 
    setSortBy 
  } = useTaskContext();

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
  };

  const handleFilterChange = (filter: FilterOption) => {
    setFilterBy(filter);
  };

  return (
    <Card className="mt-3 mb-6 bg-white dark:bg-neutral-800 shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filterBy === 'all' ? 'default' : 'outline'} 
              size="sm" 
              className="rounded-full"
              onClick={() => handleFilterChange('all')}
            >
              All Tasks
            </Button>
            <Button 
              variant={filterBy === 'priority' ? 'default' : 'outline'} 
              size="sm" 
              className="rounded-full"
              onClick={() => handleFilterChange('priority')}
            >
              Priority
            </Button>
            <Button 
              variant={filterBy === 'dueDate' ? 'default' : 'outline'} 
              size="sm" 
              className="rounded-full"
              onClick={() => handleFilterChange('dueDate')}
            >
              Due Date
            </Button>
            <Button 
              variant={filterBy === 'tags' ? 'default' : 'outline'} 
              size="sm" 
              className="rounded-full"
              onClick={() => handleFilterChange('tags')}
            >
              Tags
            </Button>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-neutral-400 dark:text-neutral-400 mr-2">Sort by:</span>
            <Select defaultValue={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[140px] text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskFilters;
