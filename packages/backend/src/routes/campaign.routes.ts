import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  createCampaignSchema,
  updateCampaignSchema,
  scheduleCampaignSchema,
  campaignIdSchema,
} from '../schemas/campaign.schema.js';

const router = Router();

// All campaign routes require authentication
router.use(authenticate);

router.get('/', campaignController.list);
router.post('/', validate(createCampaignSchema), campaignController.create);
router.get('/:id', validate(campaignIdSchema), campaignController.getById);
router.patch('/:id', validate(updateCampaignSchema), campaignController.update);
router.delete('/:id', validate(campaignIdSchema), campaignController.remove);
router.post('/:id/schedule', validate(scheduleCampaignSchema), campaignController.schedule);
router.post('/:id/send', validate(campaignIdSchema), campaignController.send);
router.get('/:id/stats', validate(campaignIdSchema), campaignController.getStats);

export default router;
