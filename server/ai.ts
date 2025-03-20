import OpenAI from "openai";
import type { Task, Subtask } from "@shared/schema";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "your-api-key" });

interface AITaskBreakdown {
  subtasks: Subtask[];
}

interface AIProductivityInsight {
  insight: string;
  suggestion: string;
}

interface AIWorkflowSuggestion {
  title: string;
  description: string;
  actionable: boolean;
}

/**
 * Analyzes a task description and breaks it down into smaller subtasks
 */
export async function generateTaskBreakdown(task: Task): Promise<AITaskBreakdown> {
  try {
    const prompt = `
      I need to break down the following task into smaller, actionable subtasks:
      
      Task Title: ${task.title}
      Task Description: ${task.description || "No description provided"}
      Priority: ${task.priority}
      Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
      
      Please provide a JSON response with 3-6 specific subtasks that would help complete this task. 
      Format the response as: { "subtasks": [{ "id": "unique-id", "title": "subtask description", "completed": false }] }
      Make each subtask specific, actionable, and clear.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"subtasks": []}');
    
    return {
      subtasks: result.subtasks.map((subtask: any) => ({
        id: subtask.id || crypto.randomUUID?.() || `subtask-${Math.random().toString(36).substring(2, 11)}`,
        title: subtask.title,
        completed: false
      }))
    };
  } catch (error) {
    console.error("Error generating task breakdown:", error);
    return { subtasks: [] };
  }
}

/**
 * Analyzes task history and provides productivity insights
 */
export async function generateProductivityInsight(tasks: Task[]): Promise<AIProductivityInsight> {
  try {
    // Filter and prepare task data for analysis
    const completedTasks = tasks.filter(task => task.completedAt);
    const pendingTasks = tasks.filter(task => !task.completedAt);
    
    const taskData = {
      completed: completedTasks.map(t => ({
        title: t.title,
        priority: t.priority,
        created: t.createdAt.toISOString(),
        completed: t.completedAt?.toISOString(),
        timeToComplete: t.completedAt ? (new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime()) / 3600000 : null
      })),
      pending: pendingTasks.map(t => ({
        title: t.title,
        priority: t.priority,
        created: t.createdAt.toISOString(),
        dueDate: t.dueDate?.toISOString()
      }))
    };

    const prompt = `
      Analyze this task data and provide ONE productivity insight and ONE suggestion for improvement.
      Task data: ${JSON.stringify(taskData)}
      
      Provide response as JSON: { "insight": "brief productivity insight", "suggestion": "actionable suggestion" }
      Keep each field under 100 characters. Be specific, personalized and actionable.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      insight: result.insight || "Focus on high-priority tasks first to increase productivity.",
      suggestion: result.suggestion || "Try breaking complex tasks into smaller subtasks for easier progress."
    };
  } catch (error) {
    console.error("Error generating productivity insight:", error);
    return {
      insight: "AI analysis currently unavailable.",
      suggestion: "Try organizing tasks by priority to improve focus."
    };
  }
}

/**
 * Generate workflow suggestions based on task patterns
 */
export async function generateWorkflowSuggestions(tasks: Task[]): Promise<AIWorkflowSuggestion[]> {
  try {
    const prompt = `
      Analyze these tasks and provide TWO workflow optimization suggestions:
      Tasks: ${JSON.stringify(tasks.map(t => ({
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate?.toISOString(),
        workspace: t.workspace,
        tags: t.tags
      })))}
      
      Provide response as JSON array: 
      [
        { 
          "title": "short suggestion title", 
          "description": "detailed suggestion explanation", 
          "actionable": true/false
        }
      ]
      Make suggestions specific to the tasks provided. Each suggestion should be actionable and practical.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    if (Array.isArray(result)) {
      return result.slice(0, 2);
    }
    
    return [
      {
        title: "Task Grouping Recommendation",
        description: "Consider grouping related tasks together to improve focus and efficiency.",
        actionable: true
      },
      {
        title: "Priority Adjustment Suggestion",
        description: "You might want to reprioritize your task list based on upcoming deadlines.",
        actionable: true
      }
    ];
  } catch (error) {
    console.error("Error generating workflow suggestions:", error);
    return [
      {
        title: "AI suggestions unavailable",
        description: "Our AI-powered workflow suggestions are currently unavailable. Try organizing tasks by deadline.",
        actionable: false
      }
    ];
  }
}
