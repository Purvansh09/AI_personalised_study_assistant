/**
 * API Service - Axios configuration and API calls
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import { useUserStore } from '../store/userStore';
import {
    AuthResponse,
    ChatSession,
    Document,
    Flashcard,
    LearningPreferences,
    LearningProfile,
    Message,
    PracticeQuestion,
    ProfileResponse,
    ProgressStats,
    QuizAnswer,
    QuizQuestion,
    QuizResult,
    Topic,
} from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = useUserStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - logout user
            useUserStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============ Auth API ============

export const authApi = {
    register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/api/auth/register', {
            email,
            password,
            name,
        });
        return response.data;
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/api/auth/login', {
            email,
            password,
        });
        return response.data;
    },

    getProfile: async (): Promise<ProfileResponse> => {
        const response = await api.get<ProfileResponse>('/api/auth/profile');
        return response.data;
    },
};

// ============ User API ============

export const userApi = {
    getQuizQuestions: async (): Promise<{ questions: QuizQuestion[] }> => {
        const response = await api.get<{ questions: QuizQuestion[] }>('/api/user/quiz');
        return response.data;
    },

    submitQuiz: async (
        answers: QuizAnswer[],
        preferences?: LearningPreferences
    ): Promise<{ message: string; learningProfile: LearningProfile }> => {
        const response = await api.post('/api/user/quiz', { answers, preferences });
        return response.data;
    },

    getLearningProfile: async (): Promise<{ hasProfile: boolean; profile: LearningProfile | null }> => {
        const response = await api.get('/api/user/profile');
        return response.data;
    },

    updatePreferences: async (preferences: LearningPreferences): Promise<{ profile: LearningProfile }> => {
        const response = await api.patch('/api/user/preferences', { preferences });
        return response.data;
    },

    getProgress: async (): Promise<{
        topics: Topic[];
        quizResults: QuizResult[];
        stats: ProgressStats;
    }> => {
        const response = await api.get('/api/user/progress');
        return response.data;
    },
};

// ============ Chat API ============

export const chatApi = {
    getSessions: async (): Promise<{ sessions: ChatSession[] }> => {
        const response = await api.get<{ sessions: ChatSession[] }>('/api/chat/sessions');
        return response.data;
    },

    createSession: async (title?: string): Promise<{ session: ChatSession }> => {
        const response = await api.post<{ session: ChatSession }>('/api/chat/sessions', { title });
        return response.data;
    },

    getSessionMessages: async (sessionId: string): Promise<{ session: ChatSession; messages: Message[] }> => {
        const response = await api.get<{ session: ChatSession; messages: Message[] }>(
            `/api/chat/sessions/${sessionId}/messages`
        );
        return response.data;
    },

    deleteSession: async (sessionId: string): Promise<void> => {
        await api.delete(`/api/chat/sessions/${sessionId}`);
    },

    sendMessage: async (
        message: string,
        sessionId?: string,
        documentIds?: string[]
    ): Promise<{ userMessage: Message; aiMessage: Message; sessionId: string }> => {
        const response = await api.post('/api/chat/message', { message, sessionId, documentIds });
        return response.data;
    },

    generatePracticeQuestions: async (
        topic: string,
        count?: number,
        difficulty?: 'beginner' | 'intermediate' | 'advanced'
    ): Promise<{ questions: PracticeQuestion[] }> => {
        const response = await api.post('/api/chat/practice', { topic, count, difficulty });
        return response.data;
    },

    generateFlashcards: async (topic: string, count?: number): Promise<{ flashcards: Flashcard[] }> => {
        const response = await api.post('/api/chat/flashcards', { topic, count });
        return response.data;
    },
};

// ============ Document API ============

export const documentApi = {
    upload: async (file: File): Promise<{ message: string; document: Document }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    list: async (): Promise<{ documents: Document[] }> => {
        const response = await api.get('/api/documents');
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/documents/${id}`);
    },
};

// ============ Health Check ============

export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/api/health');
    return response.data;
};

export default api;
