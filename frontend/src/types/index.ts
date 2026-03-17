// Type definitions for the Study Assistant frontend

export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
}

export interface LearningProfile {
    id: string;
    userId: string;
    learningStyle: LearningStyle;
    preferences: LearningPreferences;
    quizAnswers?: QuizAnswer[];
    lastUpdated: string;
}

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';

export interface LearningPreferences {
    preferredDifficulty?: 'beginner' | 'intermediate' | 'advanced';
    subjects?: string[];
    studyTimePreference?: 'morning' | 'afternoon' | 'evening' | 'night';
    sessionDuration?: number;
}

export interface QuizQuestion {
    id: number;
    question: string;
    options: {
        text: string;
        style: LearningStyle;
        weight: number;
    }[];
}

export interface QuizAnswer {
    questionId: number;
    selectedOption: number;
}

export interface ChatSession {
    id: string;
    userId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages?: Message[];
}

export interface Message {
    id: string;
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface Topic {
    id: string;
    userId: string;
    topicName: string;
    masteryLevel: number;
    lastStudied: string;
    createdAt: string;
}

export interface QuizResult {
    id: string;
    userId: string;
    topicId?: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timestamp: string;
    topic?: Topic;
}

export interface ProgressStats {
    totalSessions: number;
    totalMessages: number;
    topicsStudied: number;
    averageMastery: number;
}

export interface Flashcard {
    front: string;
    back: string;
}

export interface PracticeQuestion {
    question: string;
    answer: string;
}

export interface Document {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
    textPreview?: string;
}

// API Response types
export interface AuthResponse {
    message: string;
    token: string;
    user: User;
    hasCompletedOnboarding?: boolean;
}

export interface ProfileResponse {
    user: User & { learningProfile?: LearningProfile };
    hasCompletedOnboarding: boolean;
}

export interface ChatMessageResponse {
    userMessage: Message;
    aiMessage: Message;
    sessionId: string;
}

export interface SessionsResponse {
    sessions: ChatSession[];
}
