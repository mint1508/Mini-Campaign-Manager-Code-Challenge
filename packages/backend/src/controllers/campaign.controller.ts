import { Request, Response, NextFunction } from 'express';
import { campaignService } from '../services/campaign.service.js';

export const campaignController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const campaigns = await campaignService.list(req.user!.userId);
      res.json({ campaigns });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const campaign = await campaignService.getById(id, req.user!.userId);
      res.json({ campaign });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignService.create(req.body, req.user!.userId);
      res.status(201).json({ campaign });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const campaign = await campaignService.update(id, req.user!.userId, req.body);
      res.json({ campaign });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await campaignService.remove(id, req.user!.userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const campaign = await campaignService.schedule(id, req.user!.userId, req.body.scheduledAt);
      res.json({ campaign });
    } catch (err) {
      next(err);
    }
  },

  async send(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const campaign = await campaignService.send(id, req.user!.userId);
      res.json({ campaign });
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const stats = await campaignService.getStats(id, req.user!.userId);
      res.json({ stats });
    } catch (err) {
      next(err);
    }
  },
};
