import { Request, Response } from "express";
import { ZodError } from "zod";
import { logRequest } from "../utils/logger";
import { contactService } from "../services/contactService";
import {
  CreateContactSchema,
  UpdateContactSchema,
} from "../models/contactModel";

export const contactController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const contacts = await contactService.getAllContacts();
      logRequest("info", "Contacts fetched", req, res, 200, {
        count: contacts.length,
      });
      res.json(contacts);
    } catch (error) {
      logRequest("error", "Failed to fetch contacts", req, res, 500, {
        error: String(error),
      });
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const contact = await contactService.getContactById(id);
      logRequest("info", "Contact fetched", req, res, 200, { id });
      res.json(contact);
    } catch (error) {
      if (error instanceof Error && error.message === "Contact not found") {
        logRequest("warn", "Contact not found", req, res, 404, { id });
        res.status(404).json({ error: "Contact not found" });
      } else {
        logRequest("error", "Failed to fetch contact", req, res, 500, {
          id,
          error: String(error),
        });
        res.status(500).json({ error: "Failed to fetch contact" });
      }
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = CreateContactSchema.parse(req.body);
      const contact = await contactService.createContact(validatedData);
      logRequest("info", "Contact created", req, res, 201, { id: contact.id });
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof ZodError) {
        logRequest("warn", "Invalid input data", req, res, 400, {
          fields: error.issues.map((issue) => issue.path.join(".")),
        });
        res.status(400).json({ error: "Invalid input data" });
      } else {
        logRequest("error", "Failed to create contact", req, res, 500, {
          error: String(error),
        });
        res.status(500).json({ error: "Failed to create contact" });
      }
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const validatedData = UpdateContactSchema.parse(req.body);
      const contact = await contactService.updateContact(id, validatedData);
      logRequest("info", "Contact updated", req, res, 200, { id });
      res.json(contact);
    } catch (error) {
      if (error instanceof Error && error.message === "Contact not found") {
        logRequest("warn", "Contact not found", req, res, 404, { id });
        res.status(404).json({ error: "Contact not found" });
      } else if (error instanceof ZodError) {
        logRequest("warn", "Invalid input data", req, res, 400, {
          id,
          fields: error.issues.map((issue) => issue.path.join(".")),
        });
        res.status(400).json({ error: "Invalid input data" });
      } else {
        logRequest("error", "Failed to update contact", req, res, 500, {
          id,
          error: String(error),
        });
        res.status(500).json({ error: "Failed to update contact" });
      }
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await contactService.deleteContact(id);
      logRequest("info", "Contact deleted", req, res, 204, { id });
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Contact not found") {
        logRequest("warn", "Contact not found", req, res, 404, { id });
        res.status(404).json({ error: "Contact not found" });
      } else {
        logRequest("error", "Failed to delete contact", req, res, 500, {
          id,
          error: String(error),
        });
        res.status(500).json({ error: "Failed to delete contact" });
      }
    }
  },

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await contactService.getContactStats();
      logRequest("info", "Contact stats fetched", req, res, 200);
      res.json(stats);
    } catch (error) {
      logRequest("error", "Failed to fetch contact stats", req, res, 500, {
        error: String(error),
      });
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  },
};
