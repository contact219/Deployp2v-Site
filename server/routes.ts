import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertNewsletterSchema, insertLeadSchema, insertDealSchema, insertActivitySchema, insertTaskSchema, insertCommunicationSchema, updateLeadSchema, updateDealSchema, updateTaskSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { enrichLead, generateFollowUpTask, generateEmailDraft, analyzeDeal } from "./ai-service";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Admin sessions: login exchanges the password for a random, expiring
// token instead of the client reusing the password itself as a bearer
// credential forever — leaking a token (XSS, logs) then doesn't leak the
// admin password or grant indefinite access.
//
// Tokens are self-verifying (random value + expiry + HMAC signed with
// ADMIN_PASSWORD) rather than looked up in an in-memory map: this repo's
// deploy workflow restarts the server process on every push to main, which
// would otherwise silently invalidate every session (and its advertised
// 12h TTL) on every deploy. A revocation set is still kept for immediate
// logout, but it's a best-effort addition on top of the real (stateless)
// expiry check, not what makes a token valid — so it's fine that the set
// itself doesn't survive a restart.
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const revokedSessions = new Set<string>();

function signSessionPayload(payload: string): string {
  return crypto.createHmac("sha256", ADMIN_PASSWORD || "").update(payload).digest("hex");
}

function issueAdminSession(): string {
  const random = crypto.randomBytes(16).toString("hex");
  const expiry = Date.now() + SESSION_TTL_MS;
  const payload = `${random}.${expiry}`;
  return `${payload}.${signSessionPayload(payload)}`;
}

function isValidAdminSession(token: string | undefined | null): boolean {
  if (!token || !ADMIN_PASSWORD || revokedSessions.has(token)) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [random, expiryStr, signature] = parts;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  const expected = Buffer.from(signSessionPayload(`${random}.${expiryStr}`), "hex");
  const provided = Buffer.from(signature, "hex");
  return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
}

// Constant-time password check: compares fixed-length SHA-256 digests so
// timing doesn't leak the password's length or a byte-by-byte prefix match.
function safeCompare(a: string, b: string): boolean {
  const digestA = crypto.createHash("sha256").update(a).digest();
  const digestB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

// Basic brute-force throttling on the login endpoint, keyed by IP.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function isLoginRateLimited(key: string): boolean {
  const entry = loginAttempts.get(key);
  if (!entry || Date.now() > entry.resetAt) return false;
  return entry.count >= LOGIN_MAX_ATTEMPTS;
}

function recordLoginFailure(key: string): void {
  const entry = loginAttempts.get(key);
  if (!entry || Date.now() > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: Date.now() + LOGIN_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearLoginFailures(key: string): void {
  loginAttempts.delete(key);
}
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
  if (typeof adminToken !== 'string' || !isValidAdminSession(adminToken)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin login: verifies the password (env var only) with a constant-time
  // comparison, then issues a random, expiring session token — the token,
  // not the password, is what the client stores and sends back on later
  // requests (see verifyAdmin).
  app.post("/api/admin/login", (req, res) => {
    const rateLimitKey = req.ip ?? "unknown";
    if (isLoginRateLimited(rateLimitKey)) {
      return res.status(429).json({ success: false, error: "Too many attempts. Try again later." });
    }

    const { password } = req.body ?? {};
    if (ADMIN_PASSWORD && typeof password === "string" && safeCompare(password, ADMIN_PASSWORD)) {
      clearLoginFailures(rateLimitKey);
      const token = issueAdminSession();
      return res.json({ success: true, token });
    }

    recordLoginFailure(rateLimitKey);
    res.status(401).json({ success: false, error: "Incorrect password" });
  });

  // Lets the client re-validate a stored session token (e.g. on page load)
  // without ever resending the password.
  app.get("/api/admin/session", verifyAdmin, (_req, res) => {
    res.json({ success: true });
  });

  // Revokes a session token immediately rather than waiting out its TTL.
  // Best-effort: the revocation set doesn't survive a process restart, but
  // the token's own signed expiry (see isValidAdminSession) still bounds it.
  app.post("/api/admin/logout", (req, res) => {
    const adminToken = req.headers['x-admin-token'];
    if (typeof adminToken === 'string') {
      revokedSessions.add(adminToken);
    }
    res.json({ success: true });
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

      // Strip characters that could break out of the quoted filename
      // parameter (the original name is attacker-supplied at upload time).
      const safeName = file.originalName.replace(/[\r\n"]/g, '_');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
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
      const updates = updateLeadSchema.parse(req.body);
      const lead = await storage.updateLead(id, updates);
      if (!lead) {
        return res.status(404).json({ success: false, error: "Lead not found" });
      }
      res.json({ success: true, lead });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ success: false, error: "Failed to update lead" });
      }
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

      const updates = updateDealSchema.parse(req.body);
      const deal = await storage.updateDeal(id, updates);

      // Log stage change
      if (updates.stage && updates.stage !== existingDeal.stage) {
        await storage.createActivity({
          leadId: existingDeal.leadId || undefined,
          dealId: id,
          type: "stage_change",
          subject: "Deal Stage Changed",
          description: `Stage changed from ${existingDeal.stage} to ${updates.stage}`
        });
      }

      res.json({ success: true, deal });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ success: false, error: "Failed to update deal" });
      }
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
      const updates = updateTaskSchema.parse(req.body);
      const task = await storage.updateTask(id, updates);
      if (!task) {
        return res.status(404).json({ success: false, error: "Task not found" });
      }
      res.json({ success: true, task });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ success: false, error: "Failed to update task" });
      }
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
