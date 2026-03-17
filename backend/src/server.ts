/**
 * Express Server Entry Point
 * AI-Powered Personalized Study Assistant
 */

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import documentRoutes from './routes/documentRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5174',
    ],
    credentials: true,
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Study Assistant API ready`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
