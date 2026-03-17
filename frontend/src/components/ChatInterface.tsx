/**
 * ChatInterface Component
 * Main chat UI with message bubbles, input, and voice support
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
    BookOpen,
    Check,
    Copy,
    Loader2,
    MessageSquarePlus,
    Send,
    Sparkles,
    Trash2
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChat } from '../hooks/useChat';
import { getLearningStyleEmoji, useUserStore } from '../store/userStore';
import { Message } from '../types';
import { DocumentPanel } from './DocumentPanel';
import { VoiceInput } from './VoiceInput';

export const ChatInterface: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const { learningProfile } = useUserStore();
    const {
        messages,
        sessions,
        currentSessionId,
        isSending,
        isLoadingMessages,
        sendMessage,
        createNewSession,
        deleteSession,
        selectSession,
        clearCurrentSession,
    } = useChat();

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle send message
    const handleSend = () => {
        const message = inputValue.trim();
        if (message && !isSending) {
            sendMessage(message, selectedDocIds.length > 0 ? selectedDocIds : undefined);
            setInputValue('');
            inputRef.current?.focus();
        }
    };

    // Handle voice transcript
    const handleVoiceTranscript = (transcript: string) => {
        if (transcript && !isSending) {
            sendMessage(transcript, selectedDocIds.length > 0 ? selectedDocIds : undefined);
        }
    };

    // Handle key press (Enter to send)
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Copy message to clipboard
    const copyMessage = async (message: Message) => {
        await navigator.clipboard.writeText(message.content);
        setCopiedMessageId(message.id);
        setTimeout(() => setCopiedMessageId(null), 2000);
    };

    return (
        <div className="flex h-full">
            {/* Sidebar - Session list */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                {/* New chat button */}
                <div className="p-4">
                    <button
                        onClick={createNewSession}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                        <MessageSquarePlus size={18} />
                        New Chat
                    </button>
                </div>

                {/* Session list */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sessions.map((session) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`
                group p-3 rounded-xl cursor-pointer transition-all duration-200
                ${currentSessionId === session.id
                                    ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }
              `}
                            onClick={() => selectSession(session.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{session.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {new Date(session.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSession(session.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 
                    dark:hover:bg-red-500/20 rounded transition-all"
                                >
                                    <Trash2 size={14} className="text-red-500" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {sessions.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No chat sessions yet</p>
                            <p className="text-xs mt-1">Start a new conversation!</p>
                        </div>
                    )}
                </div>

                {/* Document panel */}
                <DocumentPanel
                    selectedDocIds={selectedDocIds}
                    onSelectionChange={setSelectedDocIds}
                />
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col">
                {/* Chat header */}
                <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">StudyAI Assistant</h2>
                            {learningProfile && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {getLearningStyleEmoji(learningProfile.learningStyle)} Adapting to your learning style
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isLoadingMessages ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                                <Sparkles size={40} className="text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Welcome to StudyAI!
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md">
                                I'm your personalized study assistant. Ask me anything about your studies,
                                and I'll adapt my explanations to your learning style.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-6 justify-center">
                                {['Explain photosynthesis', 'Help me with algebra', 'Teach me Python basics'].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInputValue(suggestion)}
                                        className="px-4 py-2 text-sm rounded-xl bg-gray-100 dark:bg-gray-800 
                      hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`group relative max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                                        <div
                                            className={`
                        px-4 py-3 rounded-2xl
                        ${message.role === 'user'
                                                    ? 'bg-primary-600 text-white rounded-tr-md'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-md'
                                                }
                      `}
                                        >
                                            {message.role === 'assistant' ? (
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown
                                                        components={{
                                                            code({ className, children, ...props }) {
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                const isInline = !match;
                                                                return isInline ? (
                                                                    <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm" {...props}>
                                                                        {children}
                                                                    </code>
                                                                ) : (
                                                                    <SyntaxHighlighter
                                                                        style={oneDark}
                                                                        language={match[1]}
                                                                        PreTag="div"
                                                                        className="rounded-lg !mt-2 !mb-2"
                                                                    >
                                                                        {String(children).replace(/\n$/, '')}
                                                                    </SyntaxHighlighter>
                                                                );
                                                            },
                                                        }}
                                                    >
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap">{message.content}</p>
                                            )}
                                        </div>

                                        {/* Message actions */}
                                        {message.role === 'assistant' && (
                                            <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <button
                                                    onClick={() => copyMessage(message)}
                                                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                    title="Copy"
                                                >
                                                    {copiedMessageId === message.id ? (
                                                        <Check size={14} className="text-green-500" />
                                                    ) : (
                                                        <Copy size={14} className="text-gray-500" />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {/* Typing indicator */}
                    {isSending && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-md">
                                <div className="flex gap-1">
                                    <motion.div
                                        className="w-2 h-2 bg-gray-400 rounded-full"
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity }}
                                    />
                                    <motion.div
                                        className="w-2 h-2 bg-gray-400 rounded-full"
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                                    />
                                    <motion.div
                                        className="w-2 h-2 bg-gray-400 rounded-full"
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-end gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Ask me anything about your studies..."
                                rows={1}
                                className="input resize-none pr-12"
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                            />
                        </div>

                        {/* Voice input */}
                        <VoiceInput
                            onTranscriptComplete={handleVoiceTranscript}
                            disabled={isSending}
                        />

                        {/* Send button */}
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isSending}
                            className="btn-primary p-3"
                        >
                            {isSending ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Send size={20} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
