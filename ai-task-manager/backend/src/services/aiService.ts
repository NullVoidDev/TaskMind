import OpenAI from 'openai';
import { AITaskAnalysis } from '../types';

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeTask(
    title: string,
    description?: string,
    userHistory?: any[]
  ): Promise<AITaskAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(title, description, userHistory);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant specialized in task management and productivity. Analyze tasks and provide helpful suggestions for priority, timeline, and improvements.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      return this.parseAIResponse(content);
    } catch (error) {
      console.error('AI Service Error:', error);
      // Return default analysis if AI fails
      return this.getDefaultAnalysis(title, description);
    }
  }

  async improveTaskDescription(
    title: string,
    description?: string,
    targetLength: 'concise' | 'detailed' = 'concise'
  ): Promise<string> {
    try {
      const prompt = `
        Task Title: "${title}"
        Current Description: "${description || 'No description provided'}"
        
        Please rewrite this task description to be ${targetLength === 'concise' ? 'clear and concise' : 'detailed and comprehensive'}. 
        Focus on:
        - Clear action items
        - Specific deliverables
        - Success criteria
        
        Return only the improved description, no additional text.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at writing clear, actionable task descriptions. Improve the given task description while maintaining its core intent.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 300,
      });

      return response.choices[0]?.message?.content?.trim() || description || title;
    } catch (error) {
      console.error('AI Description Improvement Error:', error);
      return description || title;
    }
  }

  async suggestDeadline(
    title: string,
    description?: string,
    priority: string = 'medium',
    estimatedHours?: number
  ): Promise<Date> {
    try {
      const prompt = `
        Task: "${title}"
        Description: "${description || 'No description'}"
        Priority: ${priority}
        Estimated Hours: ${estimatedHours || 'Not specified'}
        
        Based on this task information, suggest a realistic deadline. Consider:
        - Task complexity
        - Priority level
        - Estimated time needed
        - Buffer time for unexpected issues
        
        Return only a number representing days from now (e.g., "3" for 3 days from now).
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert project manager. Suggest realistic deadlines based on task complexity and priority.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 50,
      });

      const daysFromNow = parseInt(response.choices[0]?.message?.content?.trim() || '7');
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + Math.max(1, Math.min(30, daysFromNow)));
      
      return deadline;
    } catch (error) {
      console.error('AI Deadline Suggestion Error:', error);
      // Default deadline based on priority
      const deadline = new Date();
      const defaultDays = this.getDefaultDeadlineDays(priority);
      deadline.setDate(deadline.getDate() + defaultDays);
      return deadline;
    }
  }

  private buildAnalysisPrompt(
    title: string,
    description?: string,
    userHistory?: any[]
  ): string {
    return `
      Analyze this task and provide suggestions:
      
      Task Title: "${title}"
      Description: "${description || 'No description provided'}"
      
      Please provide your analysis in this exact JSON format:
      {
        "suggestedPriority": "low|medium|high|urgent",
        "estimatedHours": number,
        "complexityScore": number (1-10),
        "daysToComplete": number,
        "reasoning": "brief explanation of your analysis"
      }
      
      Consider:
      - Keywords indicating urgency (urgent, ASAP, critical, etc.)
      - Task complexity based on description
      - Typical time requirements for similar tasks
      - Business impact indicators
    `;
  }

  private parseAIResponse(content: string): AITaskAnalysis {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      const suggestedDueDate = new Date();
      suggestedDueDate.setDate(suggestedDueDate.getDate() + (parsed.daysToComplete || 7));

      return {
        suggestedPriority: parsed.suggestedPriority || 'medium',
        suggestedDueDate,
        estimatedHours: parsed.estimatedHours || 2,
        complexityScore: parsed.complexityScore || 5,
        reasoning: parsed.reasoning || 'AI analysis completed',
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getDefaultAnalysis();
    }
  }

  private getDefaultAnalysis(title?: string, description?: string): AITaskAnalysis {
    const suggestedDueDate = new Date();
    suggestedDueDate.setDate(suggestedDueDate.getDate() + 7);

    // Simple heuristics for default analysis
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    let estimatedHours = 2;
    let complexityScore = 5;

    if (title) {
      const urgentKeywords = ['urgent', 'asap', 'critical', 'emergency', 'immediate'];
      const highKeywords = ['important', 'priority', 'deadline'];
      const lowKeywords = ['minor', 'small', 'simple', 'quick'];

      const titleLower = title.toLowerCase();
      const descLower = (description || '').toLowerCase();
      const text = `${titleLower} ${descLower}`;

      if (urgentKeywords.some(keyword => text.includes(keyword))) {
        priority = 'urgent';
        estimatedHours = 1;
        complexityScore = 8;
        suggestedDueDate.setDate(suggestedDueDate.getDate() - 5); // 2 days from now
      } else if (highKeywords.some(keyword => text.includes(keyword))) {
        priority = 'high';
        estimatedHours = 4;
        complexityScore = 7;
        suggestedDueDate.setDate(suggestedDueDate.getDate() - 2); // 5 days from now
      } else if (lowKeywords.some(keyword => text.includes(keyword))) {
        priority = 'low';
        estimatedHours = 1;
        complexityScore = 3;
        suggestedDueDate.setDate(suggestedDueDate.getDate() + 7); // 14 days from now
      }
    }

    return {
      suggestedPriority: priority,
      suggestedDueDate,
      estimatedHours,
      complexityScore,
      reasoning: 'Default analysis based on keyword detection',
    };
  }

  private getDefaultDeadlineDays(priority: string): number {
    switch (priority) {
      case 'urgent': return 2;
      case 'high': return 5;
      case 'medium': return 7;
      case 'low': return 14;
      default: return 7;
    }
  }
}

export const aiService = new AIService();