import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertNewsletterSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const ADMIN_PASSWORD = "deployp2v2024";
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
];
const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

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
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.get("/api/contacts", async (req, res) => {
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

  // Get newsletter subscribers (for admin purposes)
  app.get("/api/newsletter/subscribers", async (req, res) => {
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
  app.delete("/api/contacts/:id", async (req, res) => {
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
  app.post("/api/files", verifyAdmin, upload.single('file'), async (req, res) => {
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

  const httpServer = createServer(app);

  return httpServer;
}
