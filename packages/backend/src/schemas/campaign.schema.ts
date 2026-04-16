import { z } from 'zod';

export const createCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    subject: z.string().min(1, 'Subject is required').max(500),
    body: z.string().min(1, 'Body is required'),
    recipientEmails: z.array(z.string().email('Invalid recipient email')).min(1, 'At least one recipient is required'),
  }),
});

export const updateCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    subject: z.string().min(1).max(500).optional(),
    body: z.string().min(1).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const scheduleCampaignSchema = z.object({
  body: z.object({
    scheduledAt: z.string().datetime({ message: 'Invalid datetime format' }),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const campaignIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
