import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { UserPreference } from "@shared/schema";
import { ThemeSettings } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Hook to manage theme settings
export function useTheme() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentTheme, setCurrentTheme] = useState<string>("light");

  // Get user preferences which contain theme settings
  const { data: preferences, isLoading } = useQuery<UserPreference>({
    queryKey: ["/api/preferences"],
  });

  // Update user preferences
  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: Partial<UserPreference>) => {
      const res = await apiRequest("PATCH", "/api/preferences", newPreferences);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating preferences",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update theme settings
  const updateThemeSettings = async (settings: ThemeSettings) => {
    // Store additional theme settings in localStorage
    localStorage.setItem("themeSettings", JSON.stringify({
      accentColor: settings.accentColor,
      fontSize: settings.fontSize,
      reduceAnimations: settings.reduceAnimations,
    }));

    // Update the theme preference in the database
    await updatePreferences.mutateAsync({
      theme: settings.theme,
    });

    // Apply the theme
    applyTheme(settings.theme);

    toast({
      title: "Theme Updated",
      description: "Your theme settings have been updated.",
    });
  };

  // Apply theme to the document
  const applyTheme = (theme: string) => {
    const root = document.documentElement;

    // Remove any existing theme classes
    root.classList.remove("light", "dark");

    // If theme is system, detect user preference
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      setCurrentTheme(systemTheme);
    } else {
      // Apply the specified theme
      root.classList.add(theme);
      setCurrentTheme(theme);
    }
  };

  // Get the stored theme settings
  const getThemeSettings = (): ThemeSettings => {
    const defaultSettings: ThemeSettings = {
      theme: preferences?.theme as "light" | "dark" | "system" || "light",
      accentColor: "#6366f1", // Default primary color
      fontSize: 3, // Medium font size (1-5 scale)
      reduceAnimations: false,
    };

    const savedSettings = localStorage.getItem("themeSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        ...defaultSettings,
        ...parsed,
        theme: preferences?.theme as "light" | "dark" | "system" || parsed.theme || "light",
      };
    }

    return defaultSettings;
  };

  // Apply the theme when the component mounts or when preferences change
  useEffect(() => {
    if (preferences?.theme) {
      applyTheme(preferences.theme);
    }
  }, [preferences]);

  return {
    currentTheme,
    themeSettings: getThemeSettings(),
    isLoading,
    updateThemeSettings,
  };
}
