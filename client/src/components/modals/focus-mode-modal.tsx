import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FocusModeSettings } from '@/lib/types';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnable: (settings: FocusModeSettings) => void;
}

export function FocusModeModal({ isOpen, onClose, onEnable }: FocusModeModalProps) {
  const [settings, setSettings] = useState<FocusModeSettings>({
    enabled: false,
    duration: 60,
    showHighPriority: true,
    showTodayTasks: true,
    showMediumPriority: false,
  });

  const handleEnableFocusMode = () => {
    onEnable(settings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enable Focus Mode</DialogTitle>
          <DialogDescription>
            Focus Mode will hide all tasks except the most important ones. You can customize which tasks to display.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="high-priority" 
                checked={settings.showHighPriority}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, showHighPriority: Boolean(checked) }))
                }
              />
              <Label htmlFor="high-priority">Show high priority tasks</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="today-tasks" 
                checked={settings.showTodayTasks}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, showTodayTasks: Boolean(checked) }))
                }
              />
              <Label htmlFor="today-tasks">Show today's tasks</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="medium-priority" 
                checked={settings.showMediumPriority}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, showMediumPriority: Boolean(checked) }))
                }
              />
              <Label htmlFor="medium-priority">Show medium priority tasks</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="focus-duration">Focus duration: {settings.duration} minutes</Label>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">15m</span>
              <Slider
                id="focus-duration"
                value={[settings.duration]}
                min={15}
                max={120}
                step={15}
                onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, duration: value[0] }))
                }
                className="flex-1"
              />
              <span className="text-sm text-gray-500">2h</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Focus mode will automatically disable after the selected duration.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleEnableFocusMode}>Enable Focus Mode</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
