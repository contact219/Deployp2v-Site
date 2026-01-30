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

export const storage = new DatabaseStorage();
