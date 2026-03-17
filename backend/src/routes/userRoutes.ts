/**
 * User Routes
 * Handles user profile and learning style endpoints
 */

import { Router } from 'express';
import {
    getLearningProfile,
    getProgress,
    getQuizQuestions,
    submitQuizAnswers,
    updatePreferences,
} from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Quiz questions (public for preview)
router.get('/quiz', getQuizQuestions);

// Protected routes
router.use(authenticate);
router.post('/quiz', submitQuizAnswers);
router.get('/profile', getLearningProfile);
router.patch('/preferences', updatePreferences);
router.get('/progress', getProgress);

export default router;
