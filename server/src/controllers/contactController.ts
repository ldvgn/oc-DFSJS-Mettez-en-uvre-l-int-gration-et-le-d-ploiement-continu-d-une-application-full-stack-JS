import { Request, Response } from "express";
import { handleError, logRequest } from "../utils/logger";
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
      handleError(error, req, res, { failure: "Failed to fetch contacts" });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const contact = await contactService.getContactById(id);
      logRequest("info", "Contact fetched", req, res, 200, { id });
      res.json(contact);
    } catch (error) {
      handleError(
        error,
        req,
        res,
        { notFound: "Contact not found", failure: "Failed to fetch contact" },
        { id },
      );
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = CreateContactSchema.parse(req.body);
      const contact = await contactService.createContact(validatedData);
      logRequest("info", "Contact created", req, res, 201, { id: contact.id });
      res.status(201).json(contact);
    } catch (error) {
      handleError(error, req, res, { failure: "Failed to create contact" });
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
      handleError(
        error,
        req,
        res,
        { notFound: "Contact not found", failure: "Failed to update contact" },
        { id },
      );
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await contactService.deleteContact(id);
      logRequest("info", "Contact deleted", req, res, 204, { id });
      res.status(204).send();
    } catch (error) {
      handleError(
        error,
        req,
        res,
        { notFound: "Contact not found", failure: "Failed to delete contact" },
        { id },
      );
    }
  },

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await contactService.getContactStats();
      logRequest("info", "Contact stats fetched", req, res, 200);
      res.json(stats);
    } catch (error) {
      handleError(error, req, res, { failure: "Failed to fetch stats" });
    }
  },
};
