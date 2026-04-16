import type { Knex } from 'knex';

const config: Record<string, Knex.Config> = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://localhost:5432/minicampaign',
    migrations: {
      directory: './src/db/migrations',
      extension: 'ts',
    },
  },
  test: {
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL || 'postgres://localhost:5432/minicampaign_test',
    migrations: {
      directory: './src/db/migrations',
      extension: 'ts',
    },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './src/db/migrations',
      extension: 'ts',
    },
  },
};

export default config;
