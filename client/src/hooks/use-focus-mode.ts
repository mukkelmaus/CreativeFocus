import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { UserPreference } from "@shared/schema";
import { FocusModeSettings } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Hook to manage focus mode settings
export function useFocusMode() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [focusTimeRemaining, setFocusTimeRemaining] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  // Get user preferences which contain focus mode settings
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

  // Enable focus mode
  const enableFocusMode = async (settings: FocusModeSettings) => {
    // Update user preferences
    await updatePreferences.mutateAsync({
      focusModeEnabled: true,
      focusModeDuration: settings.duration,
    });

    // Start the timer
    setFocusTimeRemaining(settings.duration * 60); // Convert to seconds
    setTimerActive(true);

    toast({
      title: "Focus Mode Enabled",
      description: `Focus mode will automatically disable after ${settings.duration} minutes.`,
    });

    // Store settings in localStorage
    localStorage.setItem("focusModeSettings", JSON.stringify({
      showHighPriority: settings.showHighPriority,
      showTodayTasks: settings.showTodayTasks,
      showMediumPriority: settings.showMediumPriority,
    }));
  };

  // Disable focus mode
  const disableFocusMode = async () => {
    // Update user preferences
    await updatePreferences.mutateAsync({
      focusModeEnabled: false,
    });

    // Stop the timer
    setTimerActive(false);
    setFocusTimeRemaining(null);

    toast({
      title: "Focus Mode Disabled",
      description: "You've exited focus mode.",
    });
  };

  // Timer effect
  useEffect(() => {
    if (!timerActive || focusTimeRemaining === null) return;

    const intervalId = setInterval(() => {
      setFocusTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(intervalId);
          disableFocusMode();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timerActive, focusTimeRemaining]);

  // Restore focus mode state if it was active
  useEffect(() => {
    if (preferences?.focusModeEnabled && preferences?.focusModeDuration) {
      // Calculate time remaining based on when it was started
      // For this demo, we'll just set it to the full duration
      setFocusTimeRemaining(preferences.focusModeDuration * 60);
      setTimerActive(true);
    }
  }, [preferences]);

  // Get the stored focus mode filter settings
  const getFocusModeSettings = (): Partial<FocusModeSettings> => {
    const savedSettings = localStorage.getItem("focusModeSettings");
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      showHighPriority: true,
      showTodayTasks: true,
      showMediumPriority: false,
    };
  };

  // Format remaining time as MM:SS
  const formatRemainingTime = (): string => {
    if (focusTimeRemaining === null) return "00:00";
    
    const minutes = Math.floor(focusTimeRemaining / 60);
    const seconds = focusTimeRemaining % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    isFocusModeEnabled: preferences?.focusModeEnabled || false,
    focusModeDuration: preferences?.focusModeDuration || 60,
    focusTimeRemaining: formatRemainingTime(),
    isLoading,
    enableFocusMode,
    disableFocusMode,
    getFocusModeSettings,
  };
}
