import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { ThemeModal } from "@/components/modals/theme-modal";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { toast } = useToast();
  const { themeSettings } = useTheme();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-500">Customize your OneTask experience.</p>
      </div>
      
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your task preferences and application behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Task Preferences</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-completed">Show completed tasks</Label>
                    <p className="text-sm text-gray-500">Display completed tasks in your task lists</p>
                  </div>
                  <Switch id="show-completed" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-archive">Auto-archive completed tasks</Label>
                    <p className="text-sm text-gray-500">Automatically archive tasks after completion</p>
                  </div>
                  <Switch id="auto-archive" />
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">Default View</h3>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="default-view">Default task view</Label>
                  <Select defaultValue="list">
                    <SelectTrigger id="default-view">
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list">List View</SelectItem>
                      <SelectItem value="board">Board View</SelectItem>
                      <SelectItem value="calendar">Calendar View</SelectItem>
                      <SelectItem value="card">Card View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how OneTask looks and feels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme Customization</h3>
                
                <div className="grid w-full gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Current Theme</Label>
                      <p className="text-sm text-gray-500">
                        {themeSettings.theme.charAt(0).toUpperCase() + themeSettings.theme.slice(1)} mode, 
                        Font size: {themeSettings.fontSize}/5
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setIsThemeModalOpen(true)}>
                      Customize Theme
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">Accessibility</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduce-motion">Reduce motion</Label>
                    <p className="text-sm text-gray-500">Minimize animations throughout the application</p>
                  </div>
                  <Switch 
                    id="reduce-motion" 
                    checked={themeSettings.reduceAnimations} 
                    disabled
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">High contrast mode</Label>
                    <p className="text-sm text-gray-500">Increase contrast for better visibility</p>
                  </div>
                  <Switch id="high-contrast" />
                </div>
              </div>
              
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect OneTask with other services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Calendar Integration</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="google-calendar">Google Calendar</Label>
                    <p className="text-sm text-gray-500">Sync tasks with your Google Calendar</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">External Services</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="todoist">Todoist</Label>
                    <p className="text-sm text-gray-500">Import tasks from Todoist</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="github">GitHub</Label>
                    <p className="text-sm text-gray-500">Link with GitHub issues</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="slack">Slack</Label>
                    <p className="text-sm text-gray-500">Receive notifications in Slack</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Profile Information</h3>
                
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" defaultValue="Demo User" />
                </div>
                
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="demo@example.com" />
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">Security</h3>
                
                <div className="grid w-full max-w-sm gap-4">
                  <Button variant="outline">Change Password</Button>
                  <Button variant="outline">Enable Two-Factor Authentication</Button>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">Danger Zone</h3>
                
                <div className="grid w-full max-w-sm gap-4">
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
              
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <ThemeModal 
        isOpen={isThemeModalOpen} 
        onClose={() => setIsThemeModalOpen(false)} 
      />
    </div>
  );
}
