import db from '../db/connection.js';
import type { User } from '../types/index.js';

export const userRepository = {
  async findByEmail(email: string): Promise<User | undefined> {
    return db('users').where({ email }).first();
  },

  async findById(id: string): Promise<User | undefined> {
    return db('users').where({ id }).first();
  },

  async create(data: { email: string; name: string; password_hash: string }): Promise<User> {
    const [user] = await db('users').insert(data).returning('*');
    return user;
  },
};
