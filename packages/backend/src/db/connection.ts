import knex from 'knex';
import { config } from '../config.js';

const db = knex({
  client: 'pg',
  connection: config.databaseUrl,
  // Scaling: Route read queries (list, stats) to read replicas.
  // Write queries (create, update, send) go to the primary.
  pool: { min: 2, max: 10 },
});

export default db;
