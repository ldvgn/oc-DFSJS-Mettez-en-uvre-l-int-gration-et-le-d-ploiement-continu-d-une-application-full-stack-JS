import { Request, Response } from "express";
import { handleError, logRequest } from "../utils/logger";
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
      handleError(error, req, res, {
        failure: "Failed to fetch organizations",
      });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const organization = await organizationService.getOrganizationById(id);
      logRequest("info", "Organization fetched", req, res, 200, { id });
      res.json(organization);
    } catch (error) {
      handleError(
        error,
        req,
        res,
        {
          notFound: "Organization not found",
          failure: "Failed to fetch organization",
        },
        { id },
      );
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
      handleError(error, req, res, {
        failure: "Failed to create organization",
      });
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
      handleError(
        error,
        req,
        res,
        {
          notFound: "Organization not found",
          failure: "Failed to update organization",
        },
        { id },
      );
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await organizationService.deleteOrganization(id);
      logRequest("info", "Organization deleted", req, res, 204, { id });
      res.status(204).send();
    } catch (error) {
      handleError(
        error,
        req,
        res,
        {
          notFound: "Organization not found",
          failure: "Failed to delete organization",
        },
        { id },
      );
    }
  },

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await organizationService.getOrganizationStats();
      logRequest("info", "Organization stats fetched", req, res, 200);
      res.json(stats);
    } catch (error) {
      handleError(error, req, res, { failure: "Failed to fetch stats" });
    }
  },
};
