import OpenAI from "openai";
import { Task, InsertTask, TaskPriority } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TaskBreakdownSuggestion {
  subtasks: {
    title: string;
    description: string;
    priority: TaskPriority;
    estimatedDuration: number; // in minutes
  }[];
}

export interface WorkflowSuggestion {
  message: string;
  suggestedActions: string[];
}

/**
 * Uses AI to break down a complex task into manageable subtasks
 * @param task The parent task to break down
 * @param userId The user ID for context
 * @returns A list of suggested subtasks
 */
export async function generateTaskBreakdown(task: Task, userId: number): Promise<TaskBreakdownSuggestion> {
  try {
    // Check if we have a valid API key
    if (!process.env.OPENAI_API_KEY) {
      // Return mock data if no API key provided
      return getMockTaskBreakdown(task);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a productivity assistant that helps users break down complex tasks into manageable steps. " +
            "For each task, provide 3-5 subtasks that would help complete the main task. " +
            "Each subtask should have a clear title, brief description, priority level (high, medium, low), " +
            "and estimated time in minutes to complete. " +
            "Return your response as a JSON object with a 'subtasks' array containing the subtasks."
        },
        {
          role: "user",
          content: `Please break down this task into subtasks: "${task.title}". Description: "${task.description || 'No description provided.'}". Format your response as JSON.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      subtasks: result.subtasks || []
    };
  } catch (error) {
    console.error("Error generating task breakdown:", error);
    return getMockTaskBreakdown(task);
  }
}

/**
 * Use AI to generate workflow optimization suggestions based on user's tasks
 * @param tasks List of user's tasks
 * @param userId The user ID for context
 * @returns Workflow optimization suggestions
 */
export async function generateWorkflowSuggestions(tasks: Task[], userId: number): Promise<WorkflowSuggestion> {
  try {
    // Check if we have a valid API key
    if (!process.env.OPENAI_API_KEY) {
      // Return mock data if no API key provided
      return getMockWorkflowSuggestion(tasks);
    }

    // Prepare task data for the AI
    const taskSummary = tasks.map(t => ({
      title: t.title,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : 'no due date'
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a productivity assistant that helps users optimize their workflow. " +
            "Based on the user's tasks, provide helpful suggestions for improving their productivity " +
            "and task management. Focus on practical advice that can be implemented immediately. " +
            "Return your response as a JSON object with a 'message' string and a 'suggestedActions' array of strings."
        },
        {
          role: "user",
          content: `Here are my current tasks: ${JSON.stringify(taskSummary)}. Please provide suggestions to optimize my workflow in JSON format.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      message: result.message || "Here's a suggestion to improve your workflow.",
      suggestedActions: result.suggestedActions || []
    };
  } catch (error) {
    console.error("Error generating workflow suggestions:", error);
    return getMockWorkflowSuggestion(tasks);
  }
}

// Mock data functions for when no API key is provided

function getMockTaskBreakdown(task: Task): TaskBreakdownSuggestion {
  // Default mock data based on the parent task
  if (task.title.toLowerCase().includes("project proposal")) {
    return {
      subtasks: [
        {
          title: "Research industry trends",
          description: "Gather recent industry data and trends to support proposal",
          priority: TaskPriority.HIGH,
          estimatedDuration: 60
        },
        {
          title: "Define project scope",
          description: "Clearly outline what is and isn't included in the project",
          priority: TaskPriority.HIGH,
          estimatedDuration: 45
        },
        {
          title: "Create timeline",
          description: "Develop a realistic project timeline with key milestones",
          priority: TaskPriority.MEDIUM,
          estimatedDuration: 30
        },
        {
          title: "Budget breakdown",
          description: "Itemize all expected costs and resources required",
          priority: TaskPriority.MEDIUM,
          estimatedDuration: 45
        }
      ]
    };
  }
  
  // Generic breakdown for any task
  return {
    subtasks: [
      {
        title: `Research for ${task.title}`,
        description: "Gather necessary information and resources",
        priority: TaskPriority.HIGH,
        estimatedDuration: 30
      },
      {
        title: `Plan approach for ${task.title}`,
        description: "Create a step-by-step action plan",
        priority: TaskPriority.HIGH,
        estimatedDuration: 20
      },
      {
        title: `Execute ${task.title}`,
        description: "Complete the main work according to plan",
        priority: TaskPriority.MEDIUM,
        estimatedDuration: 60
      },
      {
        title: `Review ${task.title}`,
        description: "Check for quality and completeness",
        priority: TaskPriority.LOW,
        estimatedDuration: 15
      }
    ]
  };
}

function getMockWorkflowSuggestion(tasks: Task[]): WorkflowSuggestion {
  // Count high priority tasks
  const highPriorityCount = tasks.filter(t => t.priority === TaskPriority.HIGH).length;
  
  if (highPriorityCount > 2) {
    return {
      message: "I noticed you have several high-priority tasks. Consider using Focus Mode to work on these one at a time.",
      suggestedActions: [
        "Enable Focus Mode to concentrate on high-priority tasks",
        "Block out 90-minute focused work sessions with short breaks in between",
        "Consider delegating or rescheduling low-priority tasks"
      ]
    };
  }
  
  // Generic suggestion
  return {
    message: "Here's a suggestion to improve your workflow.",
    suggestedActions: [
      "Start your day by working on your most important task first",
      "Group similar tasks together to minimize context switching",
      "Schedule regular breaks to maintain productivity"
    ]
  };
}
