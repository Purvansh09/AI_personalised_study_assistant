/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and attaches userId to request
 */

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ error: 'No authorization header provided' });
            return;
        }

        // Extract token from "Bearer <token>" format
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        if (!token) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

        // Attach userId to request for use in route handlers
        req.userId = decoded.userId;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Token expired' });
            return;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        res.status(500).json({ error: 'Authentication error' });
    }
};

/**
 * Generate a JWT token for a user
 */
export const generateToken = (userId: string, email: string): string => {
    return jwt.sign(
        { userId, email } as JWTPayload,
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for routes that work differently for authenticated users
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            next();
            return;
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
            req.userId = decoded.userId;
        }

        next();
    } catch (error) {
        // Token invalid but continue anyway (it's optional)
        next();
    }
};
