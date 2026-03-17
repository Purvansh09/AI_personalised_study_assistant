/**
 * User Controller
 * Handles user profile and learning style management
 */

import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import { calculateLearningStyle, learningStyleQuestions } from '../services/learningStyleService';

const prisma = new PrismaClient();

// Validation schemas
const quizAnswersSchema = z.object({
    answers: z.array(z.object({
        questionId: z.number(),
        selectedOption: z.number(),
    })),
    preferences: z.object({
        preferredDifficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        subjects: z.array(z.string()).optional(),
        studyTimePreference: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
        sessionDuration: z.number().optional(),
    }).optional(),
});

/**
 * Get learning style quiz questions
 * GET /api/user/quiz
 */
export const getQuizQuestions = async (req: Request, res: Response): Promise<void> => {
    res.json({ questions: learningStyleQuestions });
};

/**
 * Submit learning style quiz answers
 * POST /api/user/quiz
 */
export const submitQuizAnswers = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        // Validate input
        const validation = quizAnswersSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: 'Validation failed', details: validation.error.errors });
            return;
        }

        const { answers, preferences } = validation.data;

        // Calculate learning style
        const { primaryStyle, scores } = calculateLearningStyle(answers);

        // Create or update learning profile
        const learningProfile = await prisma.learningProfile.upsert({
            where: { userId },
            update: {
                learningStyle: primaryStyle,
                preferences: JSON.stringify(preferences || {}),
                quizAnswers: JSON.stringify(answers),
            },
            create: {
                userId,
                learningStyle: primaryStyle,
                preferences: JSON.stringify(preferences || {}),
                quizAnswers: JSON.stringify(answers),
            },
        });

        console.log(`✅ Learning profile updated for user ${userId}: ${primaryStyle}`);

        res.json({
            message: 'Quiz submitted successfully',
            learningProfile: {
                ...learningProfile,
                scores,
            },
        });
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
};

/**
 * Get user's learning profile
 * GET /api/user/profile
 */
export const getLearningProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const learningProfile = await prisma.learningProfile.findUnique({
            where: { userId },
        });

        if (!learningProfile) {
            res.json({ hasProfile: false, profile: null });
            return;
        }

        res.json({
            hasProfile: true,
            profile: learningProfile,
        });
    } catch (error) {
        console.error('Get learning profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

/**
 * Update user preferences
 * PATCH /api/user/preferences
 */
export const updatePreferences = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { preferences } = req.body;

        const learningProfile = await prisma.learningProfile.upsert({
            where: { userId },
            update: { preferences: JSON.stringify(preferences) },
            create: {
                userId,
                learningStyle: 'visual', // Default
                preferences: JSON.stringify(preferences),
            },
        });

        res.json({ profile: learningProfile });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
};

/**
 * Get user's study progress/statistics
 * GET /api/user/progress
 */
export const getProgress = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        // Get topics with mastery levels
        const topics = await prisma.topic.findMany({
            where: { userId },
            orderBy: { lastStudied: 'desc' },
        });

        // Get quiz results
        const quizResults = await prisma.quizResult.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: 20,
            include: { topic: true },
        });

        // Get session count
        const sessionCount = await prisma.chatSession.count({
            where: { userId },
        });

        // Get message count
        const messageCount = await prisma.message.count({
            where: {
                session: { userId },
            },
        });

        // Calculate study streak (simplified)
        const recentSessions = await prisma.chatSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 30,
        });

        res.json({
            topics,
            quizResults,
            stats: {
                totalSessions: sessionCount,
                totalMessages: messageCount,
                topicsStudied: topics.length,
                averageMastery: topics.length > 0
                    ? Math.round(topics.reduce((acc, t) => acc + t.masteryLevel, 0) / topics.length)
                    : 0,
            },
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Failed to get progress' });
    }
};
