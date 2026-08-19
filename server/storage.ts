import { 
  users, contacts, newsletters, files, 
  leads, deals, activities, tasks, communications,
  type User, type InsertUser, type Contact, type InsertContact, 
  type Newsletter, type InsertNewsletter, type FileRecord, type InsertFile,
  type Lead, type InsertLead, type Deal, type InsertDeal,
  type Activity, type InsertActivity, type Task, type InsertTask,
  type Communication, type InsertCommunication
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  deleteContact(id: number): Promise<boolean>;
  subscribeNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  getNewsletterSubscribers(): Promise<Newsletter[]>;
  createFile(file: InsertFile): Promise<FileRecord>;
  getFiles(): Promise<FileRecord[]>;
  getFile(id: number): Promise<FileRecord | undefined>;
  deleteFile(id: number): Promise<boolean>;
  
  // CRM - Leads
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  
  // CRM - Deals
  createDeal(deal: InsertDeal): Promise<Deal>;
  getDeals(): Promise<Deal[]>;
  getDeal(id: number): Promise<Deal | undefined>;
  getDealsByLead(leadId: number): Promise<Deal[]>;
  updateDeal(id: number, updates: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: number): Promise<boolean>;
  
  // CRM - Activities
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivities(leadId?: number, dealId?: number): Promise<Activity[]>;
  
  // CRM - Tasks
  createTask(task: InsertTask): Promise<Task>;
  getTasks(filters?: { status?: string; leadId?: number; dealId?: number }): Promise<Task[]>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // CRM - Communications
  createCommunication(comm: InsertCommunication): Promise<Communication>;
  getCommunications(leadId?: number): Promise<Communication[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values({
        ...insertContact,
        company: insertContact.company || null,
        phone: insertContact.phone || null,
      })
      .returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async subscribeNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    const [newsletter] = await db
      .insert(newsletters)
      .values(insertNewsletter)
      .onConflictDoUpdate({
        target: newsletters.email,
        set: {
          isActive: true,
          subscribedAt: new Date(),
        },
      })
      .returning();
    return newsletter;
  }

  async getNewsletterSubscribers(): Promise<Newsletter[]> {
    return await db.select().from(newsletters).where(eq(newsletters.isActive, true));
  }

  async createFile(insertFile: InsertFile): Promise<FileRecord> {
    const [file] = await db
      .insert(files)
      .values(insertFile)
      .returning();
    return file;
  }

  async getFiles(): Promise<FileRecord[]> {
    return await db.select().from(files);
  }

  async getFile(id: number): Promise<FileRecord | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }

  async deleteFile(id: number): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ==================== CRM METHODS ====================

  // Leads
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead || undefined;
  }

  async deleteLead(id: number): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Deals
  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const [deal] = await db.insert(deals).values(insertDeal).returning();
    return deal;
  }

  async getDeals(): Promise<Deal[]> {
    return await db.select().from(deals).orderBy(desc(deals.createdAt));
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal || undefined;
  }

  async getDealsByLead(leadId: number): Promise<Deal[]> {
    return await db.select().from(deals).where(eq(deals.leadId, leadId));
  }

  async updateDeal(id: number, updates: Partial<InsertDeal>): Promise<Deal | undefined> {
    const [deal] = await db
      .update(deals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(deals.id, id))
      .returning();
    return deal || undefined;
  }

  async deleteDeal(id: number): Promise<boolean> {
    const result = await db.delete(deals).where(eq(deals.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Activities
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  async getActivities(leadId?: number, dealId?: number): Promise<Activity[]> {
    if (leadId) {
      return await db.select().from(activities).where(eq(activities.leadId, leadId)).orderBy(desc(activities.createdAt));
    }
    if (dealId) {
      return await db.select().from(activities).where(eq(activities.dealId, dealId)).orderBy(desc(activities.createdAt));
    }
    return await db.select().from(activities).orderBy(desc(activities.createdAt));
  }

  // Tasks
  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async getTasks(filters?: { status?: string; leadId?: number; dealId?: number }): Promise<Task[]> {
    let query = db.select().from(tasks);
    
    if (filters?.status) {
      return await db.select().from(tasks).where(eq(tasks.status, filters.status)).orderBy(desc(tasks.createdAt));
    }
    if (filters?.leadId) {
      return await db.select().from(tasks).where(eq(tasks.leadId, filters.leadId)).orderBy(desc(tasks.createdAt));
    }
    if (filters?.dealId) {
      return await db.select().from(tasks).where(eq(tasks.dealId, filters.dealId)).orderBy(desc(tasks.createdAt));
    }
    
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Communications
  async createCommunication(insertComm: InsertCommunication): Promise<Communication> {
    const [comm] = await db.insert(communications).values(insertComm).returning();
    return comm;
  }

  async getCommunications(leadId?: number): Promise<Communication[]> {
    if (leadId) {
      return await db.select().from(communications).where(eq(communications.leadId, leadId)).orderBy(desc(communications.createdAt));
    }
    return await db.select().from(communications).orderBy(desc(communications.createdAt));
  }
}

// ==================== IN-MEMORY STORAGE ====================
// Used automatically when DATABASE_URL is unset so the dev server can boot
// without Postgres. Data lives only for the lifetime of the process.

export class MemStorage implements IStorage {
  private users: User[] = [];
  private contacts: Contact[] = [];
  private newsletters: Newsletter[] = [];
  private files: FileRecord[] = [];
  private leads: Lead[] = [];
  private deals: Deal[] = [];
  private activities: Activity[] = [];
  private tasks: Task[] = [];
  private communications: Communication[] = [];

  private ids = {
    users: 0,
    contacts: 0,
    newsletters: 0,
    files: 0,
    leads: 0,
    deals: 0,
    activities: 0,
    tasks: 0,
    communications: 0,
  };

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { id: ++this.ids.users, ...insertUser };
    this.users.push(user);
    return user;
  }

  // Contacts
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const contact: Contact = {
      id: ++this.ids.contacts,
      name: insertContact.name,
      email: insertContact.email,
      company: insertContact.company ?? null,
      phone: insertContact.phone ?? null,
      message: insertContact.message,
      createdAt: new Date(),
    };
    this.contacts.push(contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return [...this.contacts];
  }

  async deleteContact(id: number): Promise<boolean> {
    const before = this.contacts.length;
    this.contacts = this.contacts.filter((c) => c.id !== id);
    return this.contacts.length < before;
  }

  // Newsletter
  async subscribeNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    const existing = this.newsletters.find((n) => n.email === insertNewsletter.email);
    if (existing) {
      existing.isActive = true;
      existing.subscribedAt = new Date();
      return existing;
    }
    const newsletter: Newsletter = {
      id: ++this.ids.newsletters,
      email: insertNewsletter.email,
      subscribedAt: new Date(),
      isActive: true,
    };
    this.newsletters.push(newsletter);
    return newsletter;
  }

  async getNewsletterSubscribers(): Promise<Newsletter[]> {
    return this.newsletters.filter((n) => n.isActive);
  }

  // Files
  async createFile(insertFile: InsertFile): Promise<FileRecord> {
    const file: FileRecord = {
      id: ++this.ids.files,
      originalName: insertFile.originalName,
      storedName: insertFile.storedName,
      mimeType: insertFile.mimeType,
      size: insertFile.size,
      uploadedAt: new Date(),
    };
    this.files.push(file);
    return file;
  }

  async getFiles(): Promise<FileRecord[]> {
    return [...this.files];
  }

  async getFile(id: number): Promise<FileRecord | undefined> {
    return this.files.find((f) => f.id === id);
  }

  async deleteFile(id: number): Promise<boolean> {
    const before = this.files.length;
    this.files = this.files.filter((f) => f.id !== id);
    return this.files.length < before;
  }

  // Leads
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const now = new Date();
    const lead: Lead = {
      id: ++this.ids.leads,
      name: insertLead.name,
      email: insertLead.email,
      phone: insertLead.phone ?? null,
      company: insertLead.company ?? null,
      source: insertLead.source ?? "website",
      aiSummary: insertLead.aiSummary ?? null,
      industry: insertLead.industry ?? null,
      companySize: insertLead.companySize ?? null,
      estimatedBudget: insertLead.estimatedBudget ?? null,
      urgency: insertLead.urgency ?? "medium",
      painPoints: insertLead.painPoints ?? null,
      status: insertLead.status ?? "new",
      score: insertLead.score ?? 0,
      tags: insertLead.tags ?? null,
      assignedTo: insertLead.assignedTo ?? null,
      originalMessage: insertLead.originalMessage ?? null,
      createdAt: now,
      updatedAt: now,
      lastContactedAt: insertLead.lastContactedAt ?? null,
      convertedAt: insertLead.convertedAt ?? null,
    };
    this.leads.push(lead);
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return [...this.leads].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.find((l) => l.id === id);
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return undefined;
    Object.assign(lead, updates, { updatedAt: new Date() });
    return lead;
  }

  async deleteLead(id: number): Promise<boolean> {
    const before = this.leads.length;
    this.leads = this.leads.filter((l) => l.id !== id);
    return this.leads.length < before;
  }

  // Deals
  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const now = new Date();
    const deal: Deal = {
      id: ++this.ids.deals,
      leadId: insertDeal.leadId ?? null,
      title: insertDeal.title,
      value: insertDeal.value ?? null,
      currency: insertDeal.currency ?? "USD",
      stage: insertDeal.stage ?? "lead",
      probability: insertDeal.probability ?? 10,
      aiPredictedClose: insertDeal.aiPredictedClose ?? null,
      aiRecommendedAction: insertDeal.aiRecommendedAction ?? null,
      aiRiskFlags: insertDeal.aiRiskFlags ?? null,
      notes: insertDeal.notes ?? null,
      lostReason: insertDeal.lostReason ?? null,
      createdAt: now,
      updatedAt: now,
      expectedCloseDate: insertDeal.expectedCloseDate ?? null,
      closedAt: insertDeal.closedAt ?? null,
    };
    this.deals.push(deal);
    return deal;
  }

  async getDeals(): Promise<Deal[]> {
    return [...this.deals].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    return this.deals.find((d) => d.id === id);
  }

  async getDealsByLead(leadId: number): Promise<Deal[]> {
    return this.deals.filter((d) => d.leadId === leadId);
  }

  async updateDeal(id: number, updates: Partial<InsertDeal>): Promise<Deal | undefined> {
    const deal = this.deals.find((d) => d.id === id);
    if (!deal) return undefined;
    Object.assign(deal, updates, { updatedAt: new Date() });
    return deal;
  }

  async deleteDeal(id: number): Promise<boolean> {
    const before = this.deals.length;
    this.deals = this.deals.filter((d) => d.id !== id);
    return this.deals.length < before;
  }

  // Activities
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const activity: Activity = {
      id: ++this.ids.activities,
      leadId: insertActivity.leadId ?? null,
      dealId: insertActivity.dealId ?? null,
      type: insertActivity.type,
      subject: insertActivity.subject ?? null,
      description: insertActivity.description ?? null,
      aiSummary: insertActivity.aiSummary ?? null,
      sentiment: insertActivity.sentiment ?? null,
      metadata: insertActivity.metadata ?? null,
      createdAt: new Date(),
      performedBy: insertActivity.performedBy ?? null,
    };
    this.activities.push(activity);
    return activity;
  }

  async getActivities(leadId?: number, dealId?: number): Promise<Activity[]> {
    let result = this.activities;
    if (leadId) result = result.filter((a) => a.leadId === leadId);
    else if (dealId) result = result.filter((a) => a.dealId === dealId);
    return [...result].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Tasks
  async createTask(insertTask: InsertTask): Promise<Task> {
    const task: Task = {
      id: ++this.ids.tasks,
      leadId: insertTask.leadId ?? null,
      dealId: insertTask.dealId ?? null,
      title: insertTask.title,
      description: insertTask.description ?? null,
      type: insertTask.type ?? "follow_up",
      priority: insertTask.priority ?? "medium",
      status: insertTask.status ?? "pending",
      aiGenerated: insertTask.aiGenerated ?? false,
      aiReason: insertTask.aiReason ?? null,
      assignedTo: insertTask.assignedTo ?? null,
      createdAt: new Date(),
      dueDate: insertTask.dueDate ?? null,
      completedAt: insertTask.completedAt ?? null,
    };
    this.tasks.push(task);
    return task;
  }

  async getTasks(filters?: { status?: string; leadId?: number; dealId?: number }): Promise<Task[]> {
    let result = this.tasks;
    if (filters?.status) result = result.filter((t) => t.status === filters.status);
    else if (filters?.leadId) result = result.filter((t) => t.leadId === filters.leadId);
    else if (filters?.dealId) result = result.filter((t) => t.dealId === filters.dealId);
    return [...result].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return undefined;
    Object.assign(task, updates);
    return task;
  }

  async deleteTask(id: number): Promise<boolean> {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return this.tasks.length < before;
  }

  // Communications
  async createCommunication(insertComm: InsertCommunication): Promise<Communication> {
    const comm: Communication = {
      id: ++this.ids.communications,
      leadId: insertComm.leadId ?? null,
      dealId: insertComm.dealId ?? null,
      type: insertComm.type,
      direction: insertComm.direction,
      subject: insertComm.subject ?? null,
      body: insertComm.body,
      aiDraft: insertComm.aiDraft ?? false,
      aiSuggestions: insertComm.aiSuggestions ?? null,
      status: insertComm.status ?? "sent",
      createdAt: new Date(),
      sentAt: insertComm.sentAt ?? null,
      readAt: insertComm.readAt ?? null,
    };
    this.communications.push(comm);
    return comm;
  }

  async getCommunications(leadId?: number): Promise<Communication[]> {
    const result = leadId
      ? this.communications.filter((c) => c.leadId === leadId)
      : this.communications;
    return [...result].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage: IStorage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();

if (!process.env.DATABASE_URL) {
  console.log("[storage] DATABASE_URL not set — using in-memory storage (data resets on restart)");
}
