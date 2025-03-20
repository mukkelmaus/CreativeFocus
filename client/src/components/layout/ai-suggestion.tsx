import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Brain, X } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { WorkflowSuggestion } from '@/lib/types';

export function AiSuggestion() {
  const [dismissed, setDismissed] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Fetch workflow suggestions from the AI
  const { data: suggestion, isLoading } = useQuery<WorkflowSuggestion>({
    queryKey: ['/api/ai/workflow-suggestions'],
    enabled: !dismissed && showSuggestion,
  });

  // Simulate a delay before showing the suggestion
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSuggestion(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (dismissed || !showSuggestion || isLoading || !suggestion) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 border-l-4 border-l-purple-500">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Brain className="text-purple-500 mr-2 h-5 w-5" />
          <h3 className="text-base font-medium text-gray-800">AI Assistant Suggestion</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
          <X className="h-4 w-4 text-gray-400" />
        </Button>
      </div>
      <p className="text-sm text-gray-600 mb-3">{suggestion.message}</p>
      {suggestion.suggestedActions.length > 0 && (
        <div className="space-y-2 mb-3">
          {suggestion.suggestedActions.map((action, index) => (
            <div key={index} className="flex items-start">
              <div className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-sm text-gray-600">{action}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex space-x-3">
        <Button className="bg-purple-500 text-white hover:bg-purple-600">
          Apply Suggestions
        </Button>
        <Button variant="outline" onClick={() => setDismissed(true)}>
          Not Now
        </Button>
      </div>
    </div>
  );
}
