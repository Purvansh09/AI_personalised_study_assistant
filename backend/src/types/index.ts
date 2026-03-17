// Type definitions for the Study Assistant backend

export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
}

export interface LearningProfile {
    id: string;
    userId: string;
    learningStyle: LearningStyle;
    preferences: LearningPreferences;
    quizAnswers?: QuizAnswer[];
    lastUpdated: Date;
}

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';

export interface LearningPreferences {
    preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
    subjects: string[];
    studyTimePreference: 'morning' | 'afternoon' | 'evening' | 'night';
    sessionDuration: number; // in minutes
}

export interface QuizAnswer {
    questionId: number;
    answer: string;
    weight: {
        visual: number;
        auditory: number;
        kinesthetic: number;
        reading_writing: number;
    };
}

export interface ChatSession {
    id: string;
    userId: string;
    title: string;
    createdAt: Date;
}

export interface Message {
    id: string;
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatRequest {
    message: string;
    sessionId?: string;
}

export interface ChatResponse {
    message: Message;
    sessionId: string;
}

export interface AuthRequest {
    email: string;
    password: string;
    name?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface JWTPayload {
    userId: string;
    email: string;
}

// Express Request extension
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}
