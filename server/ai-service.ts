import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface LeadEnrichmentResult {
  aiSummary: string;
  industry: string;
  companySize: string;
  estimatedBudget: string;
  urgency: string;
  painPoints: string[];
  score: number;
  tags: string[];
  suggestedNextAction: string;
}

export interface FollowUpTaskResult {
  title: string;
  description: string;
  type: string;
  priority: string;
  dueDate: Date;
  aiReason: string;
}

export async function enrichLead(leadData: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  source?: string;
}): Promise<LeadEnrichmentResult> {
  try {
    const prompt = `Analyze this lead submission and provide enrichment data:

Name: ${leadData.name}
Email: ${leadData.email}
Company: ${leadData.company || "Not provided"}
Phone: ${leadData.phone || "Not provided"}
Message: ${leadData.message || "No message"}
Source: ${leadData.source || "website"}

Based on this information, provide a JSON response with:
1. aiSummary: A brief 1-2 sentence summary of the lead (who they are, what they need)
2. industry: Best guess at their industry (healthcare, retail, professional_services, manufacturing, restaurant, real_estate, construction, technology, other)
3. companySize: Estimated company size (1-5, 6-20, 21-50, 51-200, 200+)
4. estimatedBudget: Budget level based on context (low, medium, high)
5. urgency: How urgent their need seems (low, medium, high, critical)
6. painPoints: Array of 2-3 identified pain points or needs
7. score: Lead score from 0-100 based on quality and likelihood to convert
8. tags: Array of 2-4 relevant tags
9. suggestedNextAction: Recommended next step (e.g., "Schedule discovery call", "Send pricing info", "Follow up with email")

Respond with ONLY valid JSON, no markdown.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI sales assistant that analyzes leads for a B2B AI solutions company. Provide accurate lead enrichment data in JSON format."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);
    return {
      aiSummary: parsed.aiSummary || "Lead needs follow-up",
      industry: parsed.industry || "other",
      companySize: parsed.companySize || "1-5",
      estimatedBudget: parsed.estimatedBudget || "medium",
      urgency: parsed.urgency || "medium",
      painPoints: parsed.painPoints || [],
      score: parsed.score || 50,
      tags: parsed.tags || [],
      suggestedNextAction: parsed.suggestedNextAction || "Follow up with email"
    };
  } catch (error) {
    console.error("Lead enrichment error:", error);
    return {
      aiSummary: "New lead - needs review",
      industry: "other",
      companySize: "1-5",
      estimatedBudget: "medium",
      urgency: "medium",
      painPoints: [],
      score: 50,
      tags: ["new"],
      suggestedNextAction: "Review and follow up"
    };
  }
}

export async function generateFollowUpTask(context: {
  leadName: string;
  leadSummary?: string;
  lastActivity?: string;
  daysSinceLastContact?: number;
  dealStage?: string;
}): Promise<FollowUpTaskResult> {
  try {
    const prompt = `Generate a follow-up task for this lead:

Lead: ${context.leadName}
Summary: ${context.leadSummary || "No summary"}
Last Activity: ${context.lastActivity || "None"}
Days Since Last Contact: ${context.daysSinceLastContact || "Unknown"}
Deal Stage: ${context.dealStage || "lead"}

Create a specific, actionable follow-up task. Respond with JSON:
{
  "title": "Brief task title",
  "description": "Detailed description of what to do",
  "type": "follow_up|call|email|meeting|proposal",
  "priority": "low|medium|high|urgent",
  "daysUntilDue": number,
  "aiReason": "Why this task was created"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI sales assistant that creates actionable follow-up tasks. Be specific and helpful."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 300
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (parsed.daysUntilDue || 2));

    return {
      title: parsed.title || "Follow up with lead",
      description: parsed.description || "Follow up on previous conversation",
      type: parsed.type || "follow_up",
      priority: parsed.priority || "medium",
      dueDate,
      aiReason: parsed.aiReason || "Automated follow-up task"
    };
  } catch (error) {
    console.error("Follow-up task generation error:", error);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    return {
      title: `Follow up with ${context.leadName}`,
      description: "Review lead status and follow up",
      type: "follow_up",
      priority: "medium",
      dueDate,
      aiReason: "Automated follow-up (AI unavailable)"
    };
  }
}

export async function generateEmailDraft(context: {
  leadName: string;
  leadCompany?: string;
  purpose: string;
  tone?: string;
  previousContext?: string;
}): Promise<{ subject: string; body: string }> {
  try {
    const prompt = `Write a professional email for this context:

Recipient: ${context.leadName}${context.leadCompany ? ` from ${context.leadCompany}` : ""}
Purpose: ${context.purpose}
Tone: ${context.tone || "professional"}
Previous Context: ${context.previousContext || "None"}

Company: DeployP2V - AI solutions for small businesses
Contact: tsparks@deployp2v.com, (214) 604-5735

Respond with JSON:
{
  "subject": "Email subject line",
  "body": "Full email body with greeting and signature"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are writing emails on behalf of DeployP2V, an AI automation company. Be helpful, professional, and personable."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Email draft generation error:", error);
    return {
      subject: `Following up - DeployP2V`,
      body: `Hi ${context.leadName},\n\nI wanted to follow up regarding ${context.purpose}.\n\nPlease let me know if you have any questions.\n\nBest regards,\nDeployP2V Team\n(214) 604-5735`
    };
  }
}

export async function analyzeDeal(deal: {
  title: string;
  value?: string;
  stage: string;
  daysSinceLastActivity?: number;
  leadSummary?: string;
}): Promise<{
  probability: number;
  riskFlags: string[];
  recommendedAction: string;
}> {
  try {
    const prompt = `Analyze this deal and provide insights:

Deal: ${deal.title}
Value: ${deal.value || "Not specified"}
Stage: ${deal.stage}
Days Since Activity: ${deal.daysSinceLastActivity || "Unknown"}
Lead Context: ${deal.leadSummary || "No context"}

Respond with JSON:
{
  "probability": number 0-100 (close probability),
  "riskFlags": ["array of risk factors"],
  "recommendedAction": "specific next step to advance deal"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI sales analyst that evaluates deal health and provides actionable recommendations."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Deal analysis error:", error);
    return {
      probability: 50,
      riskFlags: [],
      recommendedAction: "Review deal status"
    };
  }
}
