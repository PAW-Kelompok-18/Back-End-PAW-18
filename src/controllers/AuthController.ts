// controllers/AuthController.ts

import { NextFunction, Request, Response } from 'express';
import { DocumentType } from '@typegoose/typegoose';
import { User } from '../models/User';
import { UserTokenModel } from '../models/UserToken';
import tokenTime from '../utils/tokenTime';
import createHttpError from 'http-errors';

export class AuthController {
  // GET /auth
  public static home(_req: Request, res: Response) {
    res.send('<a href="/auth/google">Authenticate With Google</a>');
  }

  // GET /auth/login
  public static async login(req: Request, res: Response) {
    const user = req.user as DocumentType<User>;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
      if (req.headers.referer) {
        res.redirect(`${req.headers.referer}/ticket`);
      } else {
        res.json({ message: 'Logged in successfully' });
      }
    } catch (error) {
      console.error('Error generating token:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // GET /auth/cookie
  public static async createCookie(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // Ensure that req.user is populated
    const user = req.user as DocumentType<User>;

    try {
      const token = await user.generateToken();
      res.cookie('jwt', token, {
        httpOnly: true, // Mitigates XSS attacks
        secure: true, // Use secure cookies in production
        maxAge: tokenTime.number, // in miliseconds
        sameSite: 'none', // CSRF protection
      });

      res.redirect('/auth/login');
    } catch (error) {
      next(error);
    }
  }

  // GET /auth/failure
  public static failure(_req: Request, _res: Response, next: NextFunction) {
    next(createHttpError(401, 'Google login failed'));
  }

  // POST /auth/logout
  public static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Delete the token from the database
      const token = req.cookies['jwt'];
      await UserTokenModel.deleteOne({ token });

      // Clear the cookie
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}
