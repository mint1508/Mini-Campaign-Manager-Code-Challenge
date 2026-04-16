import knex from 'knex';

// Ensure we're using the test database
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgres://localhost:5432/minicampaign_test';

export const testDb = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});

export async function truncateAll() {
  await testDb.raw('TRUNCATE campaign_recipients, recipients, campaigns, users CASCADE');
}
