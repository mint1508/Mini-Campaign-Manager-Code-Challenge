import type { Knex } from 'knex';
import db from '../db/connection.js';
import type { Campaign } from '../types/index.js';

export const campaignRepository = {
  async findAllByUser(userId: string): Promise<Campaign[]> {
    return db('campaigns')
      .where({ created_by: userId })
      .orderBy('created_at', 'desc');
  },

  async findById(id: string, userId: string): Promise<Campaign | undefined> {
    return db('campaigns').where({ id, created_by: userId }).first();
  },

  async create(
    data: { name: string; subject: string; body: string; created_by: string },
    trx?: Knex.Transaction,
  ): Promise<Campaign> {
    const query = (trx || db)('campaigns');
    const [campaign] = await query.insert(data).returning('*');
    return campaign;
  },

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<Campaign, 'name' | 'subject' | 'body'>>,
  ): Promise<Campaign | undefined> {
    const [campaign] = await db('campaigns')
      .where({ id, created_by: userId })
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    return campaign;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const count = await db('campaigns').where({ id, created_by: userId }).delete();
    return count > 0;
  },

  async updateStatus(
    id: string,
    status: Campaign['status'],
    scheduledAt: Date | null,
    trx?: Knex.Transaction,
  ): Promise<Campaign | undefined> {
    const query = (trx || db)('campaigns');
    const [campaign] = await query
      .where({ id })
      .update({
        status,
        scheduled_at: scheduledAt,
        updated_at: db.fn.now(),
      })
      .returning('*');
    return campaign;
  },
};
