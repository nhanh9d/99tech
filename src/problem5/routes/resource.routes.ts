import { Router, Request, Response, NextFunction } from 'express';
import { ResourceModel } from '../models/resource.model';
import { Resource, ResourceFilters } from '../types/resource.types';
import {
  validateResource,
  validateResourceUpdate,
} from '../middleware/validation.middleware';

export const resourceRouter = Router();

// Create a new resource
resourceRouter.post(
  '/',
  validateResource,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'> =
        req.body;
      const id = await ResourceModel.create(resource);
      const created = await ResourceModel.findById(id);

      res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }
);

// List resources with filters
resourceRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: ResourceFilters = {
        name: req.query.name as string,
        category: req.query.category as string,
        min_price: req.query.min_price
          ? parseFloat(req.query.min_price as string)
          : undefined,
        max_price: req.query.max_price
          ? parseFloat(req.query.max_price as string)
          : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const resources = await ResourceModel.findAll(filters);

      res.json({
        success: true,
        data: resources,
        count: resources.length,
        filters,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get a single resource by ID
resourceRouter.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid resource ID',
        });
        return;
      }

      const resource = await ResourceModel.findById(id);

      if (!resource) {
        res.status(404).json({
          success: false,
          error: 'Resource not found',
        });
        return;
      }

      res.json({
        success: true,
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update a resource
resourceRouter.put(
  '/:id',
  validateResourceUpdate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid resource ID',
        });
        return;
      }

      const updates: Partial<Resource> = req.body;
      const success = await ResourceModel.update(id, updates);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Resource not found or no updates provided',
        });
        return;
      }

      const updated = await ResourceModel.findById(id);

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete a resource
resourceRouter.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid resource ID',
        });
        return;
      }

      const resource = await ResourceModel.findById(id);

      if (!resource) {
        res.status(404).json({
          success: false,
          error: 'Resource not found',
        });
        return;
      }

      await ResourceModel.delete(id);

      res.json({
        success: true,
        message: 'Resource deleted successfully',
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  }
);