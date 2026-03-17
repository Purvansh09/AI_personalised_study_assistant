/**
 * Authentication Controller
 * Handles user registration, login, and profile retrieval
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { z } from 'zod';
import { generateToken } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate input
        const validationResult = registerSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                error: 'Validation failed',
                details: validationResult.error.errors
            });
            return;
        }

        const { email, password, name } = validationResult.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });

        // Generate JWT token
        const token = generateToken(user.id, user.email);

        console.log(`✅ New user registered: ${email}`);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate input
        const validationResult = loginSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                error: 'Validation failed',
                details: validationResult.error.errors
            });
            return;
        }

        const { email, password } = validationResult.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Generate JWT token
        const token = generateToken(user.id, user.email);

        // Check if user has completed onboarding (has learning profile)
        const learningProfile = await prisma.learningProfile.findUnique({
            where: { userId: user.id },
        });

        console.log(`✅ User logged in: ${email}`);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            },
            hasCompletedOnboarding: !!learningProfile,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                learningProfile: true,
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            user,
            hasCompletedOnboarding: !!user.learningProfile,
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};
