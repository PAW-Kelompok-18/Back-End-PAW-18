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
      const isAjax = req.xhr || req.headers.accept?.includes('json');

      if (isAjax) {
        // If it's an AJAX request, send JSON response
        res.json({
          isLoggedIn: true,
          message: 'Logged in successfully',
          user: {
            email: user.email,
          },
        });
      } else {
        // If it's a direct browser request (like from the popup), send HTML
        res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage('login-success', '*');
                }
                window.close();
              </script>
            </body>
          </html>
        `);
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
    next: NextFunction,
  ) {
    // Ensure that req.user is populated
    const user = req.user as DocumentType<User>;

    try {
      const tokenRecord = await UserTokenModel.findOne({ userId: user._id });
      if (tokenRecord) throw createHttpError(400, 'Token already exists');

      const token = await user.generateToken();
      res.cookie('jwt', token, {
        httpOnly: true, // Mitigates XSS attacks
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: tokenTime.number, // in miliseconds
        sameSite: 'lax', // CSRF protection
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
