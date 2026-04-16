import db from '../db/connection.js';
import { campaignRepository } from '../repositories/campaign.repository.js';
import { recipientRepository } from '../repositories/recipient.repository.js';
import { campaignRecipientRepository } from '../repositories/campaignRecipient.repository.js';
import { AppError } from '../middleware/errorHandler.js';

export const campaignService = {
  async list(userId: string) {
    return campaignRepository.findAllByUser(userId);
  },

  async getById(id: string, userId: string) {
    const campaign = await campaignRepository.findById(id, userId);
    if (!campaign) {
      throw new AppError('Campaign not found', 404, 'NOT_FOUND');
    }

    const recipients = await campaignRecipientRepository.findByCampaignId(id);
    return { ...campaign, recipients };
  },

  async create(
    data: { name: string; subject: string; body: string; recipientEmails: string[] },
    userId: string,
  ) {
    return db.transaction(async (trx) => {
      const campaign = await campaignRepository.create(
        { name: data.name, subject: data.subject, body: data.body, created_by: userId },
        trx,
      );

      const recipients = await recipientRepository.findOrCreateManyByEmail(
        data.recipientEmails,
        trx,
      );

      await campaignRecipientRepository.bulkCreate(
        campaign.id,
        recipients.map((r) => r.id),
        trx,
      );

      return campaign;
    });
  },

  async update(
    id: string,
    userId: string,
    data: { name?: string; subject?: string; body?: string },
  ) {
    const campaign = await campaignRepository.findById(id, userId);
    if (!campaign) {
      throw new AppError('Campaign not found', 404, 'NOT_FOUND');
    }
    if (campaign.status !== 'draft') {
      throw new AppError('Only draft campaigns can be edited', 400, 'CAMPAIGN_NOT_DRAFT');
    }

    return campaignRepository.update(id, userId, data);
  },

  async remove(id: string, userId: string) {
    const campaign = await campaignRepository.findById(id, userId);
    if (!campaign) {
      throw new AppError('Campaign not found', 404, 'NOT_FOUND');
    }
    if (campaign.status !== 'draft') {
      throw new AppError('Only draft campaigns can be deleted', 400, 'CAMPAIGN_NOT_DRAFT');
    }

    await campaignRepository.delete(id, userId);
  },

  async schedule(id: string, userId: string, scheduledAt: string) {
    const campaign = await campaignRepository.findById(id, userId);
    if (!campaign) {
      throw new AppError('Campaign not found', 404, 'NOT_FOUND');
    }
    if (campaign.status !== 'draft') {
      throw new AppError('Only draft campaigns can be scheduled', 400, 'CAMPAIGN_NOT_DRAFT');
    }

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      throw new AppError('Scheduled time must be in the future', 400, 'INVALID_SCHEDULE');
    }

    return campaignRepository.updateStatus(id, 'scheduled', scheduledDate);
  },

  async send(id: string, userId: string) {
    const campaign = await campaignRepository.findById(id, userId);
    if (!campaign) {
      throw new AppError('Campaign not found', 404, 'NOT_FOUND');
    }
    if (campaign.status === 'sent') {
      throw new AppError('Campaign has already been sent', 400, 'ALREADY_SENT');
    }

    // Scaling: Replace this synchronous operation with a message queue (Bull/BullMQ + Redis).
    // Producer enqueues a send job; workers process recipients in batches with retry/backoff.
    // This decouples the HTTP response from the actual sending.
    return db.transaction(async (trx) => {
      const updated = await campaignRepository.updateStatus(id, 'sent', campaign.scheduled_at, trx);
      await campaignRecipientRepository.markAllAsSent(id, trx);
      return updated;
    });
  },

  async getStats(id: string, userId: string) {
    const campaign = await campaignRepository.findById(id, userId);
    if (!campaign) {
      throw new AppError('Campaign not found', 404, 'NOT_FOUND');
    }

    return campaignRecipientRepository.getStats(id);
  },
};
