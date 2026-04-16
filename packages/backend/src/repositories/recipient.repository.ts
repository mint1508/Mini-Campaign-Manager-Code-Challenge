import type { Knex } from 'knex';
import db from '../db/connection.js';
import type { Recipient } from '../types/index.js';

export const recipientRepository = {
  async findOrCreateByEmail(
    email: string,
    trx?: Knex.Transaction,
  ): Promise<Recipient> {
    const query = trx || db;

    // Try to find existing recipient first
    const existing = await query('recipients').where({ email }).first();
    if (existing) return existing;

    // Insert new recipient
    const [recipient] = await query('recipients')
      .insert({ email })
      .returning('*');
    return recipient;
  },

  async findOrCreateManyByEmail(
    emails: string[],
    trx?: Knex.Transaction,
  ): Promise<Recipient[]> {
    const recipients: Recipient[] = [];
    for (const email of emails) {
      const recipient = await this.findOrCreateByEmail(email, trx);
      recipients.push(recipient);
    }
    return recipients;
  },
};
