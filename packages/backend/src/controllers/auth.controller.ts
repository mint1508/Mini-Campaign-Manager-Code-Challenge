import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, password } = req.body;
      const { user, token } = await authService.register(email, name, password);
      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      res.cookie('token', token, COOKIE_OPTIONS);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie('token', { ...COOKIE_OPTIONS, maxAge: 0 });
    res.json({ message: 'Logged out' });
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ user: req.user });
    } catch (err) {
      next(err);
    }
  },
};
