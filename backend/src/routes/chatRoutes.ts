/**
 * Chat Routes
 * Handles chat sessions and messaging endpoints
 */

import { Router } from 'express';
import {
    createSession,
    deleteSession,
    getFlashcards,
    getPracticeQuestions,
    getSessionMessages,
    getSessions,
    sendMessage,
} from '../controllers/chatController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Chat sessions
router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.get('/sessions/:sessionId/messages', getSessionMessages);
router.delete('/sessions/:sessionId', deleteSession);

// Messaging
router.post('/message', sendMessage);

// Study features
router.post('/practice', getPracticeQuestions);
router.post('/flashcards', getFlashcards);

export default router;
