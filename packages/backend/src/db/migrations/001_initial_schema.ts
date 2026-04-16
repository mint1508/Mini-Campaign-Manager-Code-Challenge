import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID generation
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // --- USERS ---
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).notNullable().unique(); // implicit unique index
    table.string('name', 255).notNullable();
    table.string('password_hash', 255).notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // --- CAMPAIGNS ---
  await knex.schema.createTable('campaigns', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('subject', 500).notNullable();
    table.text('body').notNullable();
    table.string('status', 20).notNullable().defaultTo('draft')
      .checkIn(['draft', 'scheduled', 'sent']);
    table.timestamp('scheduled_at', { useTz: true }).nullable();
    table.uuid('created_by').notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // GET /campaigns lists campaigns for the authenticated user — avoids full table scan
    table.index('created_by', 'idx_campaigns_created_by');
  });

  // Partial index: future background job finds scheduled campaigns due for sending
  // WHERE status='scheduled' AND scheduled_at <= NOW() — tiny index, only scheduled rows
  await knex.raw(`
    CREATE INDEX idx_campaigns_status_scheduled
    ON campaigns(status, scheduled_at)
    WHERE status = 'scheduled'
  `);

  // --- RECIPIENTS ---
  await knex.schema.createTable('recipients', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).notNullable().unique(); // implicit unique index — used for upsert on campaign create
    table.string('name', 255).nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // --- CAMPAIGN_RECIPIENTS (junction table) ---
  // Scaling: For tables with millions of rows, consider partitioning by campaign_id
  // (hash partition) or by created month (range partition).
  await knex.schema.createTable('campaign_recipients', (table) => {
    table.uuid('campaign_id').notNullable()
      .references('id').inTable('campaigns').onDelete('CASCADE');
    table.uuid('recipient_id').notNullable()
      .references('id').inTable('recipients').onDelete('CASCADE');
    table.string('status', 20).notNullable().defaultTo('pending')
      .checkIn(['pending', 'sent', 'failed']);
    table.timestamp('sent_at', { useTz: true }).nullable();
    table.timestamp('opened_at', { useTz: true }).nullable();

    table.primary(['campaign_id', 'recipient_id']); // composite PK = index on (campaign_id, recipient_id)

    // The composite PK has campaign_id leading, so it cannot serve lookups by recipient_id alone.
    // This supports "which campaigns include this recipient?" and makes the FK constraint efficient.
    table.index('recipient_id', 'idx_cr_recipient_id');
  });

  // Stats query: SELECT status, COUNT(*) FROM campaign_recipients WHERE campaign_id=? GROUP BY status
  // This composite index makes it an index-only scan (status value is in the index, no heap fetch).
  await knex.raw(`
    CREATE INDEX idx_cr_campaign_status
    ON campaign_recipients(campaign_id, status)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('campaign_recipients');
  await knex.schema.dropTableIfExists('recipients');
  await knex.schema.dropTableIfExists('campaigns');
  await knex.schema.dropTableIfExists('users');
}
