import { pgTable, text, serial, integer, bigint, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  company: true,
  phone: true,
  message: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletters).pick({
  email: true,
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  originalName: text("original_name").notNull(),
  storedName: text("stored_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Newsletter = typeof newsletters.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type FileRecord = typeof files.$inferSelect;

// ==================== CRM SCHEMA ====================

// Leads - Enhanced contacts with AI enrichment
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  // Basic Info
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  source: text("source").default("website"), // website, chat, email, referral, manual
  
  // AI Enrichment
  aiSummary: text("ai_summary"), // AI-generated lead summary
  industry: text("industry"), // Auto-detected industry
  companySize: text("company_size"), // 1-5, 6-20, 21-50, 51-200, 200+
  estimatedBudget: text("estimated_budget"), // low, medium, high
  urgency: text("urgency").default("medium"), // low, medium, high, critical
  painPoints: text("pain_points"), // JSON array of identified pain points
  
  // Status & Scoring
  status: text("status").default("new"), // new, contacted, qualified, unqualified, converted
  score: integer("score").default(0), // 0-100 lead score
  tags: text("tags"), // JSON array of tags
  
  // Assignment
  assignedTo: text("assigned_to"),
  
  // Original message if from contact form
  originalMessage: text("original_message"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastContactedAt: timestamp("last_contacted_at"),
  convertedAt: timestamp("converted_at"),
});

// Deals - Sales pipeline
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  
  // Deal Info
  title: text("title").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
  
  // Pipeline
  stage: text("stage").default("lead"), // lead, qualified, proposal, negotiation, won, lost
  probability: integer("probability").default(10), // 0-100 close probability
  
  // AI Predictions
  aiPredictedClose: timestamp("ai_predicted_close"),
  aiRecommendedAction: text("ai_recommended_action"),
  aiRiskFlags: text("ai_risk_flags"), // JSON array of risk factors
  
  // Details
  notes: text("notes"),
  lostReason: text("lost_reason"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  expectedCloseDate: timestamp("expected_close_date"),
  closedAt: timestamp("closed_at"),
});

// Activities - Timeline of all interactions
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  dealId: integer("deal_id").references(() => deals.id),
  
  // Activity Info
  type: text("type").notNull(), // email, call, meeting, note, task_completed, stage_change
  subject: text("subject"),
  description: text("description"),
  
  // AI Analysis
  aiSummary: text("ai_summary"),
  sentiment: text("sentiment"), // positive, neutral, negative
  
  // Metadata
  metadata: text("metadata"), // JSON for additional data
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  performedBy: text("performed_by"),
});

// Tasks - AI-generated and manual tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  dealId: integer("deal_id").references(() => deals.id),
  
  // Task Info
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").default("follow_up"), // follow_up, call, email, meeting, proposal, other
  priority: text("priority").default("medium"), // low, medium, high, urgent
  
  // Status
  status: text("status").default("pending"), // pending, in_progress, completed, cancelled
  
  // AI
  aiGenerated: boolean("ai_generated").default(false),
  aiReason: text("ai_reason"), // Why AI created this task
  
  // Assignment
  assignedTo: text("assigned_to"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
});

// Communications - Email and message log
export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  dealId: integer("deal_id").references(() => deals.id),
  
  // Message Info
  type: text("type").notNull(), // email, sms, chat
  direction: text("direction").notNull(), // inbound, outbound
  subject: text("subject"),
  body: text("body").notNull(),
  
  // AI
  aiDraft: boolean("ai_draft").default(false),
  aiSuggestions: text("ai_suggestions"), // JSON array of suggested responses
  
  // Status
  status: text("status").default("sent"), // draft, scheduled, sent, delivered, read, replied
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
  readAt: timestamp("read_at"),
});

// Insert schemas for CRM
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  id: true,
  createdAt: true,
});

// CRM Types
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;
export type Communication = typeof communications.$inferSelect;
