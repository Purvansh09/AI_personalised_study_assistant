/**
 * useChat Hook
 * Chat functionality with React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { chatApi } from '../services/api';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';

export function useChat() {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useUserStore();
    const {
        currentSessionId,
        setCurrentSession,
        setCurrentSessionId,
        setMessages,
        addMessage,
        setSessions,
        addSession,
        removeSession,
        setSending,
        isSending,
        messages,
        sessions,
    } = useChatStore();

    // Fetch all sessions
    const sessionsQuery = useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            const data = await chatApi.getSessions();
            setSessions(data.sessions);
            return data.sessions;
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60, // 1 minute
    });

    // Fetch messages for current session
    const messagesQuery = useQuery({
        queryKey: ['messages', currentSessionId],
        queryFn: async () => {
            if (!currentSessionId) return { messages: [] };
            const data = await chatApi.getSessionMessages(currentSessionId);
            setMessages(data.messages);
            setCurrentSession(data.session);
            return data;
        },
        enabled: !!currentSessionId && isAuthenticated,
    });

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async ({ message, documentIds }: { message: string; documentIds?: string[] }) => {
            setSending(true);
            return chatApi.sendMessage(message, currentSessionId || undefined, documentIds);
        },
        onSuccess: (data) => {
            // Add both user and AI messages
            addMessage(data.userMessage);
            addMessage(data.aiMessage);

            // Update session if new one was created
            if (!currentSessionId) {
                setCurrentSessionId(data.sessionId);
                // Refetch sessions to include new one
                queryClient.invalidateQueries({ queryKey: ['sessions'] });
            }
        },
        onError: (error: Error) => {
            toast.error('Failed to send message. Please try again.');
            console.error('Send message error:', error);
        },
        onSettled: () => {
            setSending(false);
        },
    });

    // Create new session mutation
    const createSessionMutation = useMutation({
        mutationFn: chatApi.createSession,
        onSuccess: (data) => {
            addSession(data.session);
            setCurrentSession(data.session);
            setCurrentSessionId(data.session.id);
            setMessages([]);
        },
        onError: () => {
            toast.error('Failed to create new chat');
        },
    });

    // Delete session mutation
    const deleteSessionMutation = useMutation({
        mutationFn: chatApi.deleteSession,
        onSuccess: (_, sessionId) => {
            removeSession(sessionId);
            toast.success('Chat deleted');
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
        onError: () => {
            toast.error('Failed to delete chat');
        },
    });

    // Generate practice questions
    const practiceQuestionsMutation = useMutation({
        mutationFn: ({ topic, count, difficulty }: { topic: string; count?: number; difficulty?: 'beginner' | 'intermediate' | 'advanced' }) =>
            chatApi.generatePracticeQuestions(topic, count, difficulty),
    });

    // Generate flashcards
    const flashcardsMutation = useMutation({
        mutationFn: ({ topic, count }: { topic: string; count?: number }) =>
            chatApi.generateFlashcards(topic, count),
    });

    return {
        // State
        sessions,
        messages,
        currentSessionId,
        isSending,
        isLoadingSessions: sessionsQuery.isLoading,
        isLoadingMessages: messagesQuery.isLoading,

        // Actions
        sendMessage: (message: string, documentIds?: string[]) =>
            sendMessageMutation.mutate({ message, documentIds }),
        createNewSession: () => createSessionMutation.mutate(undefined),
        deleteSession: deleteSessionMutation.mutate,
        selectSession: (sessionId: string) => setCurrentSessionId(sessionId),
        clearCurrentSession: () => {
            setCurrentSessionId(null);
            setCurrentSession(null);
            setMessages([]);
        },

        // Study features
        generatePracticeQuestions: practiceQuestionsMutation.mutateAsync,
        generateFlashcards: flashcardsMutation.mutateAsync,

        // Refetch
        refetchSessions: () => sessionsQuery.refetch(),
        refetchMessages: () => messagesQuery.refetch(),
    };
}
