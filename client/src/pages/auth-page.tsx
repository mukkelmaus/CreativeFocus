import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  
  // If already logged in, redirect to homepage
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Auth Form Section */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <AuthTabs 
            onLogin={(data) => loginMutation.mutate(data)}
            onRegister={(data) => registerMutation.mutate(data)}
            isLoading={loginMutation.isPending || registerMutation.isPending}
          />
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="flex-1 bg-primary/10 p-8 flex flex-col justify-center items-center text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">OneTask</h1>
          <p className="text-xl mb-8">
            The ultimate task management application designed for creative and neurodiverse individuals.
          </p>
          <div className="space-y-4">
            <FeatureItem title="Focus Mode">
              Reduces decision fatigue by presenting one task at a time.
            </FeatureItem>
            <FeatureItem title="AI-Assisted Planning">
              Get intelligent breakdown of complex tasks.
            </FeatureItem>
            <FeatureItem title="Multiple Views">
              Visualize your tasks in the way that works best for you.
            </FeatureItem>
            <FeatureItem title="Customizable">
              Adapt the interface to your preferences and needs.
            </FeatureItem>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-primary/20 rounded-lg p-4 bg-background">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground">{children}</p>
    </div>
  );
}

interface AuthFormData {
  username: string;
  password: string;
  email?: string;
  displayName?: string;
}

interface AuthTabsProps {
  onLogin: (data: AuthFormData) => void;
  onRegister: (data: AuthFormData) => void;
  isLoading: boolean;
}

function AuthTabs({ onLogin, onRegister, isLoading }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("login");
  
  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <LoginForm onSubmit={onLogin} isLoading={isLoading} />
      </TabsContent>
      
      <TabsContent value="register">
        <RegisterForm onSubmit={onRegister} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
}

function LoginForm({ onSubmit, isLoading }: { onSubmit: (data: AuthFormData) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState<AuthFormData>({
    username: "",
    password: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-username">Username</Label>
            <Input
              id="login-username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (data: AuthFormData) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState<AuthFormData>({
    username: "",
    password: "",
    email: "",
    displayName: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-username">Username</Label>
            <Input
              id="register-username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-displayName">Display Name</Label>
            <Input
              id="register-displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}