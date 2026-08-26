import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertNewsletterSchema, insertLeadSchema, insertDealSchema, insertActivitySchema, insertTaskSchema, insertCommunicationSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { enrichLead, generateFollowUpTask, generateEmailDraft, analyzeDeal } from "./ai-service";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
// Admin-only file store (token-gated): accept anything except executable /
// script content. Files are stored under random hex names and served back
// as attachments, so the risk being screened here is a stored executable,
// not markup injection.
const BLOCKED_MIME_TYPES = new Set([
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-dosexec',
  'application/x-executable',
  'application/x-mach-binary',
  'application/x-elf',
  'application/x-sh',
  'application/x-csh',
  'application/x-bat',
  'application/x-msi',
  'application/java-archive',
  'application/vnd.microsoft.portable-executable',
]);
const BLOCKED_EXTENSIONS =
  /\.(exe|msi|bat|cmd|com|scr|pif|dll|sh|ps1|vbs|js|jar|apk|app|deb|rpm)$/i;
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (BLOCKED_MIME_TYPES.has(file.mimetype) || BLOCKED_EXTENSIONS.test(file.originalname)) {
      cb(new Error(`Executable files are not allowed (${file.originalname})`));
    } else {
      cb(null, true);
    }
  }
});

const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  const adminToken = req.headers['x-admin-token'];
  if (!ADMIN_PASSWORD || adminToken !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin login check — password lives in the ADMIN_PASSWORD env var only
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body ?? {};
    if (ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
      return res.json({ success: true });
    }
    res.status(401).json({ success: false, error: "Incorrect password" });
  });

  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.json({ success: true, contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: "Validation failed", 
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Failed to submit contact form" 
        });
      }
    }
  });

  // Get all contacts (for admin purposes)
  app.get("/api/contacts", verifyAdmin, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json({ success: true, contacts });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve contacts" 
      });
    }
  });

  // Newsletter subscription endpoint
  app.post("/api/newsletter", async (req, res) => {
    try {
      const validatedData = insertNewsletterSchema.parse(req.body);
      const newsletter = await storage.subscribeNewsletter(validatedData);
      res.json({ success: true, newsletter });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: "Invalid email address", 
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Failed to subscribe to newsletter" 
        });
      }
    }
  });

  // Chatbot lead capture — the chat widget posts here when a visitor
  // completes qualification or shares an email. Stored as a contact so it
  // shows up in the same admin pipeline as the contact form.
  const chatbotLeadSchema = z.object({
    name: z.string().trim().max(200).optional(),
    email: z.string().trim().email().optional(),
    company: z.string().trim().max(200).optional(),
    industry: z.string().trim().max(200).optional(),
    businessSize: z.string().trim().max(100).optional(),
    currentChallenges: z.union([z.string(), z.array(z.string())]).optional(),
    techLevel: z.string().trim().max(200).optional(),
    budget: z.string().trim().max(100).optional(),
    aiReadinessScore: z.number().min(0).max(100).optional(),
    leadScore: z.number().min(0).max(100).optional(),
    transcriptSummary: z.string().trim().max(4000).optional(),
  }).refine(
    (data) => data.email || data.aiReadinessScore !== undefined,
    { message: "Lead must include an email or a completed assessment" }
  );

  app.post("/api/chatbot-lead", async (req, res) => {
    try {
      const lead = chatbotLeadSchema.parse(req.body);
      const challenges = Array.isArray(lead.currentChallenges)
        ? lead.currentChallenges.join(", ")
        : lead.currentChallenges;
      const lines = [
        "[Chatbot lead]",
        lead.industry && `Industry: ${lead.industry}`,
        lead.businessSize && `Business size: ${lead.businessSize}`,
        challenges && `Challenges: ${challenges}`,
        lead.techLevel && `Tech level: ${lead.techLevel}`,
        lead.budget && `Budget: ${lead.budget}`,
        lead.aiReadinessScore !== undefined && `AI readiness score: ${lead.aiReadinessScore}/100`,
        lead.leadScore !== undefined && `Lead score: ${lead.leadScore}/100`,
        lead.transcriptSummary && `Notes: ${lead.transcriptSummary}`,
      ].filter(Boolean) as string[];

      const contact = await storage.createContact({
        name: lead.name || "Chatbot visitor",
        email: lead.email || "not-provided@chatbot.deployp2v.com",
        company: lead.company ?? null,
        phone: null,
        message: lines.join("\n"),
      });
      res.json({ success: true, contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Failed to save chatbot lead",
        });
      }
    }
  });

  // Get newsletter subscribers (for admin purposes)
  app.get("/api/newsletter/subscribers", verifyAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getNewsletterSubscribers();
      res.json({ success: true, subscribers });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve subscribers" 
      });
    }
  });

  // Delete contact endpoint
  app.delete("/api/contacts/:id", verifyAdmin, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      if (isNaN(contactId)) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid contact ID" 
        });
      }
      
      const success = await storage.deleteContact(contactId);
      if (success) {
        res.json({ success: true, message: "Contact deleted successfully" });
      } else {
        res.status(404).json({ 
          success: false, 
          error: "Contact not found" 
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to delete contact" 
      });
    }
  });

  // File upload endpoint (admin only)
  app.post("/api/files", verifyAdmin, (req: Request, res: Response, next: NextFunction) => {
    // Surface multer rejections (blocked type, size cap) as a 400 with the
    // real reason instead of a generic 500.
    upload.single('file')(req, res, (err: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : "Upload rejected";
        return res.status(400).json({ success: false, error: message });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
      }

      const fileRecord = await storage.createFile({
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
      });

      res.json({ success: true, file: fileRecord });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to upload file" });
    }
  });

  // Get all files (admin only)
  app.get("/api/files", verifyAdmin, async (req, res) => {
    try {
      const files = await storage.getFiles();
      res.json({ success: true, files });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to retrieve files" });
    }
  });

  // Download file (admin only)
  app.get("/api/files/:id/download", verifyAdmin, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ success: false, error: "Invalid file ID" });
      }

      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ success: false, error: "File not found" });
      }

      const filePath = path.join(uploadsDir, file.storedName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: "File not found on disk" });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimeType);
      fs.createReadStream(filePath).pipe(res);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to download file" });
    }
  });

  // Delete file (admin only)
  app.delete("/api/files/:id", verifyAdmin, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ success: false, error: "Invalid file ID" });
      }

      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ success: false, error: "File not found" });
      }

      // Delete from disk
      const filePath = path.join(uploadsDir, file.storedName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      const success = await storage.deleteFile(fileId);
      if (success) {
        res.json({ success: true, message: "File deleted successfully" });
      } else {
        res.status(500).json({ success: false, error: "Failed to delete file record" });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete file" });
    }
  });

  // ==================== CRM API ROUTES ====================

  // LEADS
  app.get("/api/crm/leads", verifyAdmin, async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json({ success: true, leads });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch leads" });
    }
  });

  app.get("/api/crm/leads/:id", verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ success: false, error: "Lead not found" });
      }
      res.json({ success: true, lead });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch lead" });
    }
  });

  app.post("/api/crm/leads", verifyAdmin, async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      
      // Enrich lead with AI if we have enough data
      let enrichmentData = {};
      if (validatedData.name && validatedData.email) {
        try {
          const enrichment = await enrichLead({
            name: validatedData.name,
            email: validatedData.email,
            company: validatedData.company || undefined,
            phone: validatedData.phone || undefined,
            message: validatedData.originalMessage || undefined,
            source: validatedData.source || undefined
          });
          enrichmentData = {
            aiSummary: enrichment.aiSummary,
            industry: enrichment.industry,
            companySize: enrichment.companySize,
            estimatedBudget: enrichment.estimatedBudget,
            urgency: enrichment.urgency,
            painPoints: JSON.stringify(enrichment.painPoints),
            score: enrichment.score,
            tags: JSON.stringify(enrichment.tags)
          };
        } catch (aiError) {
          console.error("AI enrichment failed:", aiError);
        }
      }

      const lead = await storage.createLead({ ...validatedData, ...enrichmentData });
      
      // Create initial activity
      await storage.createActivity({
        leadId: lead.id,
        type: "lead_created",
        subject: "Lead Created",
        description: `Lead ${lead.name} was created from ${lead.source || "manual entry"}`
      });

      res.json({ success: true, lead });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ success: false, error: "Failed to create lead" });
      }
    }
  });

  app.patch("/api/crm/leads/:id", verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.updateLead(id, req.body);
      if (!lead) {
        return res.status(404).json({ success: false, error: "Lead not found" });
      }
      res.json({ success: true, lead });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update lead" });
    }
  });

  app.delete("/api/crm/leads/:id", verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLead(id);
      if (success) {
        res.json({ success: true, message: "Lead deleted successfully" });
      } else {
        res.status(404).json({ success: false, error: "Lead not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete lead" });
    }
  });

  // AI Enrich Lead
  app.post("/api/crm/leads/:id/enrich", verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ success: false, error: "Lead not found" });
      }

      const enrichment = await enrichLead({
        name: lead.name,
        email: lead.email,
        company: lead.company || undefined,
        phone: lead.phone || undefined,
        message: lead.originalMessage || undefined,
        source: lead.source || undefined
      });

      const updatedLead = await storage.updateLead(id, {
        aiSummary: enrichment.aiSummary,
        industry: enrichment.industry,
        companySize: enrichment.companySize,
        estimatedBudget: enrichment.estimatedBudget,
        urgency: enrichment.urgency,
        painPoints: JSON.stringify(enrichment.painPoints),
        score: enrichment.score,
        tags: JSON.stringify(enrichment.tags)
      });

      res.json({ success: true, lead: updatedLead, enrichment });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to enrich lead" });
    }
  });

  // Convert contact to lead
  app.post("/api/crm/leads/from-contact/:contactId", verifyAdmin, async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      const contacts = await storage.getContacts();
      const contact = contacts.find(c => c.id === contactId);
      
      if (!contact) {
        return res.status(404).json({ success: false, error: "Contact not found" });
      }

      // Create lead from contact
      const enrichment = await enrichLead({
        name: contact.name,
        email: contact.email,
        company: contact.company || undefined,
        phone: contact.phone || undefined,
        message: contact.message,
        source: "website"
      });

      const lead = await storage.createLead({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        source: "website",
        originalMessage: contact.message,
        aiSummary: enrichment.aiSummary,
        industry: enrichment.industry,
        companySize: enrichment.companySize,
        estimatedBudget: enrichment.estimatedBudget,
        urgency: enrichment.urgency,
        painPoints: JSON.stringify(enrichment.painPoints),
        score: enrichment.score,
        tags: JSON.stringify(enrichment.tags)
      });

      // Create activity
      await storage.createActivity({
        leadId: lead.id,
        type: "lead_created",
        subject: "Lead Created from Website Contact",
        description: `Converted from contact form submission on ${contact.createdAt}`
      });

      res.json({ success: true, lead });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to convert contact to lead" });
    }
  });

  // DEALS
  app.get("/api/crm/deals", verifyAdmin, async (req, res) => {
    try {
      const deals = await storage.getDeals();
      res.json({ success: true, deals });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch deals" });
    }
  });

  app.get("/api/crm/deals/:id", verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deal = await storage.getDeal(id);
      if (!deal) {
        return res.status(404).json({ success: false, error: "Deal not found" });
      }
      res.json({ success: true, deal });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch deal" });
    }
  });

  app.post("/api/crm/deals", verifyAdmin, async (req, res) => {
    try {
      const validatedData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(validatedData);

      // Create activity
      if (deal.leadId) {
        await storage.createActivity({
          leadId: deal.leadId,
          dealId: deal.id,
          type: "deal_created",
          subject: "Deal Created",
          description: `Deal "${deal.title}" created with value ${deal.value || "TBD"}`
        });
      }

      res.json({ success: true, deal });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ success: false, error: "Failed to create deal" });
      }
    }
  });

  app.patch("/api/crm/deals/:id", verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingDeal = await storage.getDeal(id);
      if (!existingDeal) {
        return res.status(404).json({ success: false, error: "Deal not found" });
      }

      const deal = await storage.updateDeal(id, req.body);

      // Log stage change
      if (req.body.stage && req.body.stage !== existingDeal.stage) {
        await storage.createActivity({
          leadId: existingDeal.leadId || undefined,
          dealId: id,
          type: "stage_change",
          subject: "Deal Stage Changed",
          description: `Stage changed from ${existingDeal.stage} to ${req.body.stage}`
        });
      }

      res.json({ success: true, deal });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update deal" });
    }
  });

  app.delete("/api/crm/deals/:id", verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDeal(id);
      if (success) {
        res.json({ success: true, message: "Deal deleted successfully" });
      } else {
        res.status(404).json({ success: false, error: "Deal not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete deal" });
    }
  });

  // AI Analyze Deal
  app.post("/api/crm/deals/:id/analyze", verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deal = await storage.getDeal(id);
      if (!deal) {
        return res.status(404).json({ success: false, error: "Deal not found" });
      }

      let leadSummary: string | undefined;
      if (deal.leadId) {
        const lead = await storage.getLead(deal.leadId);
        leadSummary = lead?.aiSummary || undefined;
      }

      const analysis = await analyzeDeal({
        title: deal.title,
        value: deal.value?.toString(),
        stage: deal.stage || "lead",
        leadSummary
      });

      const updatedDeal = await storage.updateDeal(id, {
        probability: analysis.probability,
        aiRiskFlags: JSON.stringify(analysis.riskFlags),
        aiRecommendedAction: analysis.recommendedAction
      });

      res.json({ success: true, deal: updatedDeal, analysis });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to analyze deal" });
    }
  });

  // ACTIVITIES
  app.get("/api/crm/activities", verifyAdmin, async (req, res) => {
    try {
      const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : undefined;
      const dealId = req.query.dealId ? parseInt(req.query.dealId as string) : undefined;
      const activities = await storage.getActivities(leadId, dealId);
      res.json({ success: true, activities });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch activities" });
    }
  });

  app.post("/api/crm/activities", verifyAdmin, async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validatedData);

      // Update lead's last contacted at if relevant
      if (activity.leadId && ["email", "call", "meeting"].includes(activity.type)) {
        await storage.updateLead(activity.leadId, { lastContactedAt: new Date() });
      }

      res.json({ success: true, activity });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ success: false, error: "Failed to create activity" });
      }
    }
  });

  // TASKS
  app.get("/api/crm/tasks", verifyAdmin, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : undefined;
      const tasks = await storage.getTasks({ status, leadId });
      res.json({ success: true, tasks });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/crm/tasks", verifyAdmin, async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.json({ success: true, task });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ success: false, error: "Failed to create task" });
      }
    }
  });

  app.patch("/api/crm/tasks/:id", verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.updateTask(id, req.body);
      if (!task) {
        return res.status(404).json({ success: false, error: "Task not found" });
      }
      res.json({ success: true, task });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update task" });
    }
  });

  app.delete("/api/crm/tasks/:id", verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      if (success) {
        res.json({ success: true, message: "Task deleted successfully" });
      } else {
        res.status(404).json({ success: false, error: "Task not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete task" });
    }
  });

  // AI Generate Follow-up Task
  app.post("/api/crm/leads/:id/generate-task", verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ success: false, error: "Lead not found" });
      }

      const activities = await storage.getActivities(id);
      const lastActivity = activities[0];
      const daysSinceLastContact = lead.lastContactedAt 
        ? Math.floor((Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

      const taskData = await generateFollowUpTask({
        leadName: lead.name,
        leadSummary: lead.aiSummary || undefined,
        lastActivity: lastActivity?.description || undefined,
        daysSinceLastContact
      });

      const task = await storage.createTask({
        leadId: lead.id,
        title: taskData.title,
        description: taskData.description,
        type: taskData.type,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        aiGenerated: true,
        aiReason: taskData.aiReason
      });

      res.json({ success: true, task });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to generate task" });
    }
  });

  // COMMUNICATIONS
  app.get("/api/crm/communications", verifyAdmin, async (req, res) => {
    try {
      const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : undefined;
      const communications = await storage.getCommunications(leadId);
      res.json({ success: true, communications });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch communications" });
    }
  });

  app.post("/api/crm/communications", verifyAdmin, async (req, res) => {
    try {
      const validatedData = insertCommunicationSchema.parse(req.body);
      const communication = await storage.createCommunication(validatedData);

      // Create activity for communication
      if (communication.leadId) {
        await storage.createActivity({
          leadId: communication.leadId,
          type: communication.type,
          subject: communication.subject || `${communication.direction} ${communication.type}`,
          description: communication.body.substring(0, 200)
        });
        
        // Update last contacted
        if (communication.direction === "outbound") {
          await storage.updateLead(communication.leadId, { lastContactedAt: new Date() });
        }
      }

      res.json({ success: true, communication });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ success: false, error: "Failed to create communication" });
      }
    }
  });

  // AI Generate Email Draft
  app.post("/api/crm/leads/:id/draft-email", verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ success: false, error: "Lead not found" });
      }

      const { purpose, tone } = req.body;
      const draft = await generateEmailDraft({
        leadName: lead.name,
        leadCompany: lead.company || undefined,
        purpose: purpose || "follow up",
        tone: tone || "professional",
        previousContext: lead.aiSummary || undefined
      });

      res.json({ success: true, draft });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to generate email draft" });
    }
  });

  // CRM Dashboard Stats
  app.get("/api/crm/stats", verifyAdmin, async (req, res) => {
    try {
      const leads = await storage.getLeads();
      const deals = await storage.getDeals();
      const tasks = await storage.getTasks();

      const stats = {
        leads: {
          total: leads.length,
          new: leads.filter(l => l.status === "new").length,
          qualified: leads.filter(l => l.status === "qualified").length,
          converted: leads.filter(l => l.status === "converted").length
        },
        deals: {
          total: deals.length,
          byStage: {
            lead: deals.filter(d => d.stage === "lead").length,
            qualified: deals.filter(d => d.stage === "qualified").length,
            proposal: deals.filter(d => d.stage === "proposal").length,
            negotiation: deals.filter(d => d.stage === "negotiation").length,
            won: deals.filter(d => d.stage === "won").length,
            lost: deals.filter(d => d.stage === "lost").length
          },
          totalValue: deals.filter(d => d.stage !== "lost").reduce((sum, d) => sum + (parseFloat(d.value?.toString() || "0")), 0),
          avgProbability: deals.length > 0 ? Math.round(deals.reduce((sum, d) => sum + (d.probability || 0), 0) / deals.length) : 0
        },
        tasks: {
          total: tasks.length,
          pending: tasks.filter(t => t.status === "pending").length,
          overdue: tasks.filter(t => t.status === "pending" && t.dueDate && new Date(t.dueDate) < new Date()).length,
          aiGenerated: tasks.filter(t => t.aiGenerated).length
        }
      };

      res.json({ success: true, stats });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  // Allow large file uploads to run longer than Node's 5-minute default
  httpServer.requestTimeout = 2 * 60 * 60 * 1000; // 2 hours

  return httpServer;
}
