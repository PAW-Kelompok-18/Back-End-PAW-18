import express from 'express';
import passport from '../config/passport';
import { AuthController } from '../controllers/AuthController';
import { hasCookiesAndValid } from '../middlewares/hasCookiesAndValid';
import { protectUser } from '../middlewares/protectUser';

const router = express.Router();

// GET /auth
router.get('/', AuthController.home);

// GET /auth/google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

// GET /auth/google/callback
// This route handles the callback from Google OAuth
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure', // Redirect to /auth/failure on failurex
    successRedirect: '/auth/cookie', // Redirect to /auth/cookie on success
  }),
);

// GET /auth/failure
// This route handles authentication failure
router.get('/failure', AuthController.failure);

// GET /auth/cookie
// This route creates a cookie for the authenticated user
router.get('/cookie', AuthController.createCookie);

// GET /auth/login
// This route handles user login, checking for valid cookies
router.get('/login', hasCookiesAndValid, AuthController.login);

// POST /auth/logout
// This route handles user logout (currently commented out)
router.get('/logout', protectUser, AuthController.logout);

export default router;
