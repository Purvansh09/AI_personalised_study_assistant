/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 */

import { Router } from 'express';
import { getProfile, login, register } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;
