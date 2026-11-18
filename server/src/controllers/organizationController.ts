import { Request, Response } from "express";
import { ZodError } from "zod";
import { logRequest } from "../utils/logger";
import { organizationService } from "../services/organizationService";
import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
} from "../models/organizationModel";

export const organizationController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const organizations = await organizationService.getAllOrganizations();
      logRequest("info", "Organizations fetched", req, res, 200, {
        count: organizations.length,
      });
      res.json(organizations);
    } catch (error) {
      logRequest("error", "Failed to fetch organizations", req, res, 500, {
        error: String(error),
      });
      res.status(500).json({ error: "Failed to fetch organizations" });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const organization = await organizationService.getOrganizationById(id);
      logRequest("info", "Organization fetched", req, res, 200, { id });
      res.json(organization);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Organization not found"
      ) {
        logRequest("warn", "Organization not found", req, res, 404, { id });
        res.status(404).json({ error: "Organization not found" });
      } else {
        logRequest("error", "Failed to fetch organization", req, res, 500, {
          id,
          error: String(error),
        });
        res.status(500).json({ error: "Failed to fetch organization" });
      }
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = CreateOrganizationSchema.parse(req.body);
      const organization =
        await organizationService.createOrganization(validatedData);
      logRequest("info", "Organization created", req, res, 201, {
        id: organization.id,
      });
      res.status(201).json(organization);
    } catch (error) {
      if (error instanceof ZodError) {
        logRequest("warn", "Invalid input data", req, res, 400, {
          fields: error.issues.map((issue) => issue.path.join(".")),
        });
        res.status(400).json({ error: "Invalid input data" });
      } else {
        logRequest("error", "Failed to create organization", req, res, 500, {
          error: String(error),
        });
        res.status(500).json({ error: "Failed to create organization" });
      }
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const validatedData = UpdateOrganizationSchema.parse(req.body);
      const organization = await organizationService.updateOrganization(
        id,
        validatedData,
      );
      logRequest("info", "Organization updated", req, res, 200, { id });
      res.json(organization);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Organization not found"
      ) {
        logRequest("warn", "Organization not found", req, res, 404, { id });
        res.status(404).json({ error: "Organization not found" });
      } else if (error instanceof ZodError) {
        logRequest("warn", "Invalid input data", req, res, 400, {
          id,
          fields: error.issues.map((issue) => issue.path.join(".")),
        });
        res.status(400).json({ error: "Invalid input data" });
      } else {
        logRequest("error", "Failed to update organization", req, res, 500, {
          id,
          error: String(error),
        });
        res.status(500).json({ error: "Failed to update organization" });
      }
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await organizationService.deleteOrganization(id);
      logRequest("info", "Organization deleted", req, res, 204, { id });
      res.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Organization not found"
      ) {
        logRequest("warn", "Organization not found", req, res, 404, { id });
        res.status(404).json({ error: "Organization not found" });
      } else {
        logRequest("error", "Failed to delete organization", req, res, 500, {
          id,
          error: String(error),
        });
        res.status(500).json({ error: "Failed to delete organization" });
      }
    }
  },

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await organizationService.getOrganizationStats();
      logRequest("info", "Organization stats fetched", req, res, 200);
      res.json(stats);
    } catch (error) {
      logRequest("error", "Failed to fetch organization stats", req, res, 500, {
        error: String(error),
      });
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  },
};
