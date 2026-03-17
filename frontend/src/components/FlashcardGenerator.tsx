/**
 * FlashcardGenerator Component
 * Generate and review flashcards for any topic
 */

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, RotateCcw, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { Flashcard } from '../types';

interface FlashcardGeneratorProps {
    initialTopic?: string;
}

export const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({ initialTopic = '' }) => {
    const [topic, setTopic] = useState(initialTopic);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { generateFlashcards } = useChat();

    // Generate flashcards
    const handleGenerate = async () => {
        if (!topic.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await generateFlashcards({ topic: topic.trim(), count: 10 });
            setFlashcards(result.flashcards);
            setCurrentIndex(0);
            setIsFlipped(false);
        } catch (err) {
            setError('Failed to generate flashcards. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Navigation
    const goNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        }
    };

    const goPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
        }
    };

    const currentCard = flashcards[currentIndex];

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-secondary flex items-center justify-center">
                    <Sparkles size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Flashcard Generator
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Generate flashcards for any topic to reinforce your learning
                </p>
            </div>

            {/* Topic input */}
            <div className="flex gap-3 mb-8">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a topic (e.g., Photosynthesis, Python basics)"
                    className="input flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                    onClick={handleGenerate}
                    disabled={!topic.trim() || isLoading}
                    className="btn-secondary flex items-center gap-2"
                >
                    {isLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <RefreshCw size={20} />
                    )}
                    Generate
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="text-center text-red-500 mb-4">{error}</div>
            )}

            {/* Flashcard display */}
            {flashcards.length > 0 && (
                <div className="space-y-6">
                    {/* Card */}
                    <div className="perspective-1000">
                        <motion.div
                            className="relative w-full h-64 cursor-pointer"
                            onClick={() => setIsFlipped(!isFlipped)}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isFlipped ? 'back' : 'front'}
                                    initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`
                    absolute inset-0 rounded-2xl p-8 flex items-center justify-center text-center
                    ${isFlipped
                                            ? 'bg-secondary-100 dark:bg-secondary-500/20 border-2 border-secondary-500'
                                            : 'bg-primary-100 dark:bg-primary-500/20 border-2 border-primary-500'
                                        }
                  `}
                                >
                                    <div>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            {isFlipped ? 'Answer' : 'Question'}
                                        </span>
                                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-2">
                                            {isFlipped ? currentCard.back : currentCard.front}
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Flip hint */}
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        <RotateCcw size={14} className="inline mr-1" />
                        Click the card to flip
                    </p>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={goPrevious}
                            disabled={currentIndex === 0}
                            className="btn-ghost flex items-center gap-2 disabled:opacity-50"
                        >
                            <ChevronLeft size={20} />
                            Previous
                        </button>

                        <span className="text-gray-600 dark:text-gray-400">
                            {currentIndex + 1} / {flashcards.length}
                        </span>

                        <button
                            onClick={goNext}
                            disabled={currentIndex === flashcards.length - 1}
                            className="btn-ghost flex items-center gap-2 disabled:opacity-50"
                        >
                            Next
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full gradient-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Empty state */}
            {flashcards.length === 0 && !isLoading && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Enter a topic above to generate flashcards</p>
                </div>
            )}
        </div>
    );
};

export default FlashcardGenerator;
