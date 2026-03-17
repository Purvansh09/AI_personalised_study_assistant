/**
 * Chat Store - Zustand state management for chat sessions and messages
 */

import { create } from 'zustand';
import { ChatSession, Message } from '../types';

interface ChatState {
    // Current session
    currentSessionId: string | null;
    currentSession: ChatSession | null;
    messages: Message[];

    // All sessions
    sessions: ChatSession[];

    // Loading states
    isLoading: boolean;
    isSending: boolean;

    // Actions
    setCurrentSession: (session: ChatSession | null) => void;
    setCurrentSessionId: (sessionId: string | null) => void;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    setSessions: (sessions: ChatSession[]) => void;
    addSession: (session: ChatSession) => void;
    removeSession: (sessionId: string) => void;
    setLoading: (loading: boolean) => void;
    setSending: (sending: boolean) => void;
    clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    // Initial state
    currentSessionId: null,
    currentSession: null,
    messages: [],
    sessions: [],
    isLoading: false,
    isSending: false,

    // Actions
    setCurrentSession: (session) => {
        set({
            currentSession: session,
            currentSessionId: session?.id || null,
        });
    },

    setCurrentSessionId: (sessionId) => {
        set({ currentSessionId: sessionId });
    },

    setMessages: (messages) => {
        set({ messages });
    },

    addMessage: (message) => {
        set((state) => ({
            messages: [...state.messages, message],
        }));
    },

    setSessions: (sessions) => {
        set({ sessions });
    },

    addSession: (session) => {
        set((state) => ({
            sessions: [session, ...state.sessions],
        }));
    },

    removeSession: (sessionId) => {
        set((state) => ({
            sessions: state.sessions.filter((s) => s.id !== sessionId),
            currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
            currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
            messages: state.currentSessionId === sessionId ? [] : state.messages,
        }));
    },

    setLoading: (loading) => {
        set({ isLoading: loading });
    },

    setSending: (sending) => {
        set({ isSending: sending });
    },

    clearChat: () => {
        set({
            currentSessionId: null,
            currentSession: null,
            messages: [],
        });
    },
}));
