/**
 * Chat Controller
 * Handles chat sessions and message processing
 */

import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import { generateFlashcards, generatePracticeQuestions, getChatResponse } from '../services/aiService';

const prisma = new PrismaClient();

// Validation schemas
const sendMessageSchema = z.object({
    message: z.string().min(1, 'Message is required'),
    sessionId: z.string().optional(),
    documentIds: z.array(z.string()).optional(),
});

const createSessionSchema = z.object({
    title: z.string().optional(),
});

/**
 * Send a message and get AI response
 * POST /api/chat/message
 */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        // Validate input
        const validation = sendMessageSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: 'Validation failed', details: validation.error.errors });
            return;
        }

        const { message, sessionId, documentIds } = validation.data;

        // Get or create session
        let session;
        if (sessionId) {
            session = await prisma.chatSession.findFirst({
                where: { id: sessionId, userId },
            });
            if (!session) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }
        } else {
            // Create new session with auto-generated title
            const title = message.length > 50 ? message.slice(0, 47) + '...' : message;
            session = await prisma.chatSession.create({
                data: { userId, title },
            });
        }

        // Save user message
        const userMessage = await prisma.message.create({
            data: {
                sessionId: session.id,
                role: 'user',
                content: message,
            },
        });

        // Get conversation history for context
        const history = await prisma.message.findMany({
            where: { sessionId: session.id },
            orderBy: { timestamp: 'asc' },
            take: 20, // Last 20 messages for context
        });

        const conversationHistory = history.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));

        // Fetch document context if documentIds provided
        let documentContext = '';
        if (documentIds && documentIds.length > 0) {
            const documents = await prisma.document.findMany({
                where: {
                    id: { in: documentIds },
                    userId,
                },
                select: {
                    originalName: true,
                    textContent: true,
                },
            });

            if (documents.length > 0) {
                documentContext = documents
                    .map(doc => `[Document: ${doc.originalName}]\n${doc.textContent}`)
                    .join('\n\n---\n\n');
                // Truncate to avoid token limits (roughly ~4000 chars)
                if (documentContext.length > 4000) {
                    documentContext = documentContext.slice(0, 4000) + '\n[...document truncated]';
                }
            }
        }

        // Get AI response
        const aiResponseContent = await getChatResponse(
            userId,
            message,
            session.id,
            conversationHistory,
            documentContext
        );

        // Save AI response
        const aiMessage = await prisma.message.create({
            data: {
                sessionId: session.id,
                role: 'assistant',
                content: aiResponseContent,
            },
        });

        console.log(`💬 Chat exchange in session ${session.id}`);

        res.json({
            userMessage,
            aiMessage,
            sessionId: session.id,
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
};

/**
 * Get all chat sessions for user
 * GET /api/chat/sessions
 */
export const getSessions = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const sessions = await prisma.chatSession.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    take: 1,
                    orderBy: { timestamp: 'desc' },
                },
            },
        });

        res.json({ sessions });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ error: 'Failed to get sessions' });
    }
};

/**
 * Get messages for a specific session
 * GET /api/chat/sessions/:sessionId/messages
 */
export const getSessionMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        // Verify session belongs to user
        const session = await prisma.chatSession.findFirst({
            where: { id: sessionId, userId },
        });

        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        const messages = await prisma.message.findMany({
            where: { sessionId },
            orderBy: { timestamp: 'asc' },
        });

        res.json({ session, messages });
    } catch (error) {
        console.error('Get session messages error:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
};

/**
 * Create a new chat session
 * POST /api/chat/sessions
 */
export const createSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const validation = createSessionSchema.safeParse(req.body);
        const title = validation.success ? validation.data.title : 'New Chat';

        const session = await prisma.chatSession.create({
            data: {
                userId,
                title: title || 'New Chat',
            },
        });

        res.status(201).json({ session });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
};

/**
 * Delete a chat session
 * DELETE /api/chat/sessions/:sessionId
 */
export const deleteSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        // Verify session belongs to user
        const session = await prisma.chatSession.findFirst({
            where: { id: sessionId, userId },
        });

        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        await prisma.chatSession.delete({
            where: { id: sessionId },
        });

        res.json({ message: 'Session deleted' });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
};

/**
 * Generate practice questions
 * POST /api/chat/practice
 */
export const getPracticeQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { topic, count, difficulty } = req.body;

        if (!topic) {
            res.status(400).json({ error: 'Topic is required' });
            return;
        }

        const questions = await generatePracticeQuestions(topic, count || 5, difficulty || 'intermediate');

        res.json(questions);
    } catch (error) {
        console.error('Generate practice questions error:', error);
        res.status(500).json({ error: 'Failed to generate questions' });
    }
};

/**
 * Generate flashcards
 * POST /api/chat/flashcards
 */
export const getFlashcards = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { topic, count } = req.body;

        if (!topic) {
            res.status(400).json({ error: 'Topic is required' });
            return;
        }

        const flashcards = await generateFlashcards(topic, count || 10);

        res.json({ flashcards });
    } catch (error) {
        console.error('Generate flashcards error:', error);
        res.status(500).json({ error: 'Failed to generate flashcards' });
    }
};
