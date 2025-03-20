import React from "react";
import { useTaskContext } from "@/context/taskContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Brain, LightbulbIcon } from "lucide-react";

const AIAssistant: React.FC = () => {
  const { aiSuggestions, aiInsights, showAiSection, toggleAiSection } = useTaskContext();

  // If AI section is hidden, return null
  if (!showAiSection) {
    return null;
  }

  // If no suggestions or insights, show loading state
  if (!aiSuggestions.length && !aiInsights) {
    return (
      <Card className="mt-8 bg-white dark:bg-neutral-800 shadow border border-neutral-200 dark:border-neutral-700">
        <CardHeader className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <CardTitle className="text-lg leading-6 font-medium text-neutral-500 dark:text-neutral-200">AI Workflow Assistant</CardTitle>
            <CardDescription className="mt-1 max-w-2xl text-sm text-neutral-400 dark:text-neutral-400">AI-powered suggestions to improve your task management.</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-neutral-400 hover:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-300"
            onClick={toggleAiSection}
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="text-center py-8">
            <Brain className="mx-auto h-10 w-10 text-neutral-300 dark:text-neutral-600 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">
              AI assistant is analyzing your tasks...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 bg-white dark:bg-neutral-800 shadow border border-neutral-200 dark:border-neutral-700">
      <CardHeader className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700">
        <div>
          <CardTitle className="text-lg leading-6 font-medium text-neutral-500 dark:text-neutral-200">AI Workflow Assistant</CardTitle>
          <CardDescription className="mt-1 max-w-2xl text-sm text-neutral-400 dark:text-neutral-400">AI-powered suggestions to improve your task management.</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-neutral-400 hover:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-300"
          onClick={toggleAiSection}
        >
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="space-y-4">
          {aiSuggestions.map((suggestion, index) => (
            <div key={index} className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
              <div className="flex items-start">
                <Brain className="text-primary-light mr-3 h-5 w-5" />
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-300">{suggestion.title}</h4>
                  <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-400">{suggestion.description}</p>
                  {suggestion.actionable && (
                    <div className="mt-3 flex space-x-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        className="text-sm"
                      >
                        Apply Suggestion
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-sm"
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {aiInsights && (
            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
              <div className="flex items-start">
                <LightbulbIcon className="text-primary-light mr-3 h-5 w-5" />
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-300">Productivity Insight</h4>
                  <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-400">{aiInsights.insight}</p>
                  <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-400">{aiInsights.suggestion}</p>
                  <div className="mt-3 flex space-x-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="text-sm"
                    >
                      Apply to schedule
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-sm"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
