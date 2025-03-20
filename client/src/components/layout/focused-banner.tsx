import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";
import { useFocusMode } from "@/hooks/use-focus-mode";

export function FocusedBanner() {
  const { isFocusModeEnabled, disableFocusMode, focusTimeRemaining } = useFocusMode();

  if (!isFocusModeEnabled) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-primary-500 mr-3">
            <Maximize className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-medium text-gray-800">Focus Mode Available</h3>
            <p className="text-sm text-gray-500">Enable focus mode to concentrate on your highest priority tasks.</p>
          </div>
        </div>
        <Button 
          className="bg-primary-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition"
          onClick={() => {}}
        >
          Enable
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 rounded-lg shadow-sm p-4 mb-6 border border-primary-200 flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-primary-500 mr-3">
          <Maximize className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-medium text-primary-900">Focus Mode Active</h3>
          <p className="text-sm text-primary-700">
            Stay focused on your important tasks. Time remaining: {focusTimeRemaining}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        className="border-primary-200 hover:bg-primary-100 text-primary-700"
        onClick={() => disableFocusMode()}
      >
        End Focus Mode
      </Button>
    </div>
  );
}
