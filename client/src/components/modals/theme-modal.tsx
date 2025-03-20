import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTheme } from '@/hooks/use-theme';
import { ThemeSettings } from '@/lib/types';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const { themeSettings, updateThemeSettings } = useTheme();
  const [settings, setSettings] = useState<ThemeSettings>(themeSettings);

  // Update the local state when the theme settings change
  useEffect(() => {
    setSettings(themeSettings);
  }, [themeSettings]);

  const handleApplyTheme = () => {
    updateThemeSettings(settings);
    onClose();
  };

  const colorOptions = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Green', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Theme</DialogTitle>
          <DialogDescription>
            Select a theme that works best for you.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div 
              className={`theme-option border-2 ${settings.theme === 'light' ? 'border-primary-500' : 'border-gray-200'} rounded-lg p-2 flex flex-col items-center cursor-pointer`}
              onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
            >
              <div className="w-full h-12 bg-white rounded mb-2"></div>
              <span className="text-xs font-medium">Light</span>
            </div>
            <div 
              className={`theme-option border-2 ${settings.theme === 'dark' ? 'border-primary-500' : 'border-gray-200'} rounded-lg p-2 flex flex-col items-center cursor-pointer`}
              onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
            >
              <div className="w-full h-12 bg-gray-900 rounded mb-2"></div>
              <span className="text-xs font-medium">Dark</span>
            </div>
            <div 
              className={`theme-option border-2 ${settings.theme === 'system' ? 'border-primary-500' : 'border-gray-200'} rounded-lg p-2 flex flex-col items-center cursor-pointer`}
              onClick={() => setSettings(prev => ({ ...prev, theme: 'system' }))}
            >
              <div className="w-full h-12 bg-gradient-to-r from-gray-100 to-gray-300 rounded mb-2"></div>
              <span className="text-xs font-medium">System</span>
            </div>
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</Label>
            <div className="flex space-x-2">
              {colorOptions.map((color) => (
                <div 
                  key={color.value}
                  className={`w-8 h-8 rounded-full cursor-pointer ${settings.accentColor === color.value ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSettings(prev => ({ ...prev, accentColor: color.value }))}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-1">Font Size</Label>
            <div className="flex items-center space-x-2">
              <span className="text-xs">A</span>
              <Slider
                value={[settings.fontSize]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, fontSize: value[0] }))
                }
                className="flex-1"
              />
              <span className="text-lg">A</span>
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Reduce Animations</Label>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={settings.reduceAnimations}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, reduceAnimations: checked }))
                }
              />
              <span className="text-sm text-gray-500">Helpful for users with motion sensitivity</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApplyTheme}>Apply Theme</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
