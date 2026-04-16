import type { Knex } from 'knex';
import db from '../db/connection.js';
import type { CampaignRecipient, CampaignStats } from '../types/index.js';

export const campaignRecipientRepository = {
  async bulkCreate(
    campaignId: string,
    recipientIds: string[],
    trx?: Knex.Transaction,
  ): Promise<void> {
    const rows = recipientIds.map((recipientId) => ({
      campaign_id: campaignId,
      recipient_id: recipientId,
      status: 'pending' as const,
    }));
    await (trx || db)('campaign_recipients').insert(rows);
  },

  async findByCampaignId(campaignId: string): Promise<(CampaignRecipient & { email: string; name: string | null })[]> {
    return db('campaign_recipients')
      .join('recipients', 'campaign_recipients.recipient_id', 'recipients.id')
      .where('campaign_recipients.campaign_id', campaignId)
      .select(
        'campaign_recipients.*',
        'recipients.email',
        'recipients.name',
      );
  },

  async markAllAsSent(campaignId: string, trx?: Knex.Transaction): Promise<void> {
    // Scaling: Replace synchronous send with a message queue (Bull/BullMQ + Redis).
    // Producer enqueues a send job; workers process recipients in batches with retry/backoff.
    // This decouples the HTTP response from the actual sending.
    await (trx || db)('campaign_recipients')
      .where({ campaign_id: campaignId, status: 'pending' })
      .update({
        status: 'sent',
        sent_at: db.fn.now(),
      });
  },

  async getStats(campaignId: string): Promise<CampaignStats> {
    // Scaling: Cache computed stats in Redis with a short TTL (30-60s).
    // Invalidate on send/status change. For very large campaigns, use
    // materialized views or pre-aggregated counters.
    const rows = await db('campaign_recipients')
      .where({ campaign_id: campaignId })
      .select(
        db.raw('COUNT(*)::int as total'),
        db.raw("COUNT(*) FILTER (WHERE status = 'sent')::int as sent"),
        db.raw("COUNT(*) FILTER (WHERE status = 'failed')::int as failed"),
        db.raw('COUNT(opened_at)::int as opened'),
      );

    const { total, sent, failed, opened } = rows[0] || { total: 0, sent: 0, failed: 0, opened: 0 };

    return {
      total,
      sent,
      failed,
      opened,
      open_rate: total > 0 ? Math.round((opened / total) * 10000) / 10000 : 0,
      send_rate: total > 0 ? Math.round((sent / total) * 10000) / 10000 : 0,
    };
  },
};
