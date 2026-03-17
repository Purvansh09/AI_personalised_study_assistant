/**
 * User Store - Zustand state management for authentication and user profile
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LearningProfile, LearningStyle, User } from '../types';

interface UserState {
    // Auth state
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;

    // Learning profile
    learningProfile: LearningProfile | null;
    hasCompletedOnboarding: boolean;

    // Theme
    theme: 'light' | 'dark';

    // Actions
    setUser: (user: User, token: string) => void;
    setLearningProfile: (profile: LearningProfile) => void;
    setOnboardingComplete: (complete: boolean) => void;
    logout: () => void;
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            token: null,
            isAuthenticated: false,
            learningProfile: null,
            hasCompletedOnboarding: false,
            theme: 'dark',

            // Actions
            setUser: (user, token) => {
                set({
                    user,
                    token,
                    isAuthenticated: true,
                });
            },

            setLearningProfile: (profile) => {
                set({
                    learningProfile: profile,
                    hasCompletedOnboarding: true,
                });
            },

            setOnboardingComplete: (complete) => {
                set({ hasCompletedOnboarding: complete });
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    learningProfile: null,
                    hasCompletedOnboarding: false,
                });
            },

            toggleTheme: () => {
                const newTheme = get().theme === 'light' ? 'dark' : 'light';
                set({ theme: newTheme });
                // Update document class for Tailwind dark mode
                if (newTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            },

            setTheme: (theme) => {
                set({ theme });
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            },
        }),
        {
            name: 'study-assistant-user',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                learningProfile: state.learningProfile,
                hasCompletedOnboarding: state.hasCompletedOnboarding,
                theme: state.theme,
            }),
            onRehydrate: () => {
                // Apply theme on load
                return (state) => {
                    if (state?.theme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                };
            },
        }
    )
);

// Helper function to get learning style display name
export const getLearningStyleDisplayName = (style: LearningStyle): string => {
    const names: Record<LearningStyle, string> = {
        visual: 'Visual Learner',
        auditory: 'Auditory Learner',
        kinesthetic: 'Kinesthetic Learner',
        reading_writing: 'Reading/Writing Learner',
    };
    return names[style];
};

// Helper function to get learning style emoji
export const getLearningStyleEmoji = (style: LearningStyle): string => {
    const emojis: Record<LearningStyle, string> = {
        visual: '👁️',
        auditory: '🎧',
        kinesthetic: '🤸',
        reading_writing: '📚',
    };
    return emojis[style];
};
