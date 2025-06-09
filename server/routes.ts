import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertNewsletterSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);

  return httpServer;
}
