/**
 * LearningStyleQuiz Component
 * Onboarding quiz to determine user's learning style (VARK model)
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { userApi } from '../services/api';
import { getLearningStyleDisplayName, getLearningStyleEmoji, useUserStore } from '../store/userStore';
import { LearningStyle } from '../types';

interface LearningStyleQuizProps {
    onComplete: () => void;
}

export const LearningStyleQuiz: React.FC<LearningStyleQuizProps> = ({ onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<{ questionId: number; selectedOption: number }[]>([]);
    const [showResult, setShowResult] = useState(false);
    const { setLearningProfile } = useUserStore();

    // Fetch quiz questions
    const { data: questionsData, isLoading: isLoadingQuestions } = useQuery({
        queryKey: ['quizQuestions'],
        queryFn: userApi.getQuizQuestions,
    });

    const questions = questionsData?.questions || [];

    // Submit quiz mutation
    const submitMutation = useMutation({
        mutationFn: async () => {
            return userApi.submitQuiz(answers, {
                preferredDifficulty: 'intermediate',
            });
        },
        onSuccess: (data) => {
            setLearningProfile(data.learningProfile);
            setShowResult(true);
        },
        onError: () => {
            toast.error('Failed to submit quiz. Please try again.');
        },
    });

    // Handle option select
    const selectOption = (optionIndex: number) => {
        const question = questions[currentQuestion];
        const existingAnswerIndex = answers.findIndex(a => a.questionId === question.id);

        const newAnswer = { questionId: question.id, selectedOption: optionIndex };

        if (existingAnswerIndex >= 0) {
            const newAnswers = [...answers];
            newAnswers[existingAnswerIndex] = newAnswer;
            setAnswers(newAnswers);
        } else {
            setAnswers([...answers, newAnswer]);
        }

        // Auto-advance to next question
        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
            }
        }, 300);
    };

    // Get selected option for current question
    const getSelectedOption = () => {
        const question = questions[currentQuestion];
        const answer = answers.find(a => a.questionId === question?.id);
        return answer?.selectedOption;
    };

    // Handle submit
    const handleSubmit = () => {
        if (answers.length === questions.length) {
            submitMutation.mutate();
        }
    };

    // Navigate questions
    const goToPrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const goToNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    if (isLoadingQuestions) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    // Show result screen
    if (showResult && submitMutation.data) {
        const result = submitMutation.data.learningProfile;
        const style = result.learningStyle as LearningStyle;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-screen flex items-center justify-center p-6"
            >
                <div className="card p-8 max-w-lg w-full text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-24 h-24 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center text-4xl"
                    >
                        {getLearningStyleEmoji(style)}
                    </motion.div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        You're a {getLearningStyleDisplayName(style)}!
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {style === 'visual' && "You learn best through images, diagrams, and visual representations. I'll adapt my explanations with charts and visual breakdowns."}
                        {style === 'auditory' && "You learn best through listening and verbal explanations. I'll use conversational tones, analogies, and memorable phrases."}
                        {style === 'kinesthetic' && "You learn best through hands-on activities and practical exercises. I'll provide step-by-step activities and real-world examples."}
                        {style === 'reading_writing' && "You learn best through reading and writing. I'll provide detailed written explanations, lists, and note-taking formats."}
                    </p>

                    <motion.button
                        onClick={onComplete}
                        className="btn-primary w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Start Learning
                        <ChevronRight size={20} className="inline ml-2" />
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const isLastQuestion = currentQuestion === questions.length - 1;
    const allAnswered = answers.length === questions.length;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
                        <Sparkles size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Discover Your Learning Style
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Answer these questions to help us personalize your learning experience
                    </p>
                </div>

                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Question {currentQuestion + 1} of {questions.length}</span>
                        <span>{Math.round(progress)}% complete</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full gradient-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Question card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="card p-6 mb-6"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                            {question?.question}
                        </h2>

                        <div className="space-y-3">
                            {question?.options.map((option, index) => {
                                const isSelected = getSelectedOption() === index;
                                return (
                                    <motion.button
                                        key={index}
                                        onClick={() => selectOption(index)}
                                        className={`
                      w-full p-4 rounded-xl text-left transition-all duration-200
                      ${isSelected
                                                ? 'bg-primary-100 dark:bg-primary-500/20 border-2 border-primary-500'
                                                : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                            }
                    `}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <span className={`
                      font-medium
                      ${isSelected
                                                ? 'text-primary-700 dark:text-primary-300'
                                                : 'text-gray-700 dark:text-gray-300'
                                            }
                    `}>
                                            {option.text}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex justify-between">
                    <button
                        onClick={goToPrevious}
                        disabled={currentQuestion === 0}
                        className="btn-ghost flex items-center gap-2 disabled:opacity-50"
                    >
                        <ChevronLeft size={20} />
                        Previous
                    </button>

                    {isLastQuestion ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!allAnswered || submitMutation.isPending}
                            className="btn-primary flex items-center gap-2"
                        >
                            {submitMutation.isPending ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    See Results
                                    <Sparkles size={20} />
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={goToNext}
                            disabled={getSelectedOption() === undefined}
                            className="btn-primary flex items-center gap-2"
                        >
                            Next
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LearningStyleQuiz;
