/**
 * ProgressDashboard Component
 * Study progress, topics, stats, and quiz results visualization
 */

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Clock,
    Loader2,
    MessageSquare,
    Sparkles,
    Target,
    TrendingUp,
} from 'lucide-react';
import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { userApi } from '../services/api';
import { getLearningStyleDisplayName, getLearningStyleEmoji, useUserStore } from '../store/userStore';

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#14b8a6', '#f59e0b'];

export const ProgressDashboard: React.FC = () => {
    const { learningProfile, user } = useUserStore();

    // Fetch progress data
    const { data, isLoading } = useQuery({
        queryKey: ['progress'],
        queryFn: userApi.getProgress,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    const { topics = [], quizResults = [], stats } = data || {
        topics: [],
        quizResults: [],
        stats: { totalSessions: 0, totalMessages: 0, topicsStudied: 0, averageMastery: 0 },
    };

    // Prepare chart data
    const topicChartData = topics.slice(0, 5).map((topic) => ({
        name: topic.topicName.length > 15 ? topic.topicName.slice(0, 15) + '...' : topic.topicName,
        mastery: topic.masteryLevel,
    }));

    const quizChartData = quizResults.slice(0, 5).map((result) => ({
        name: result.topic?.topicName || 'General',
        score: result.score,
    }));

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Your Progress
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Track your learning journey
                    </p>
                </div>
                {learningProfile && (
                    <div className="card p-4 flex items-center gap-3">
                        <span className="text-2xl">{getLearningStyleEmoji(learningProfile.learningStyle)}</span>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Learning Style</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {getLearningStyleDisplayName(learningProfile.learningStyle)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-5"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {stats?.totalSessions || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Study Sessions</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card p-5"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-500/20 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {stats?.topicsStudied || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Topics Studied</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-5"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-500/20 flex items-center justify-center">
                            <Target className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {stats?.averageMastery || 0}%
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Mastery</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card p-5"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {stats?.totalMessages || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Messages Sent</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Topic Mastery Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Topic Mastery
                    </h3>
                    {topicChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={topicChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#f9fafb',
                                    }}
                                />
                                <Bar dataKey="mastery" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <BookOpen size={40} className="mx-auto mb-2 opacity-50" />
                                <p>No topics studied yet</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Quiz Scores Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Recent Quiz Scores
                    </h3>
                    {quizChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={quizChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="score"
                                    label={({ name, score }) => `${name}: ${score}%`}
                                >
                                    {quizChartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#f9fafb',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Target size={40} className="mx-auto mb-2 opacity-50" />
                                <p>No quiz results yet</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Recent Topics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Recent Topics
                </h3>
                {topics.length > 0 ? (
                    <div className="space-y-3">
                        {topics.slice(0, 5).map((topic, index) => (
                            <div
                                key={topic.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}
                                    >
                                        <Sparkles
                                            size={20}
                                            style={{ color: COLORS[index % COLORS.length] }}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {topic.topicName}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Last studied: {new Date(topic.lastStudied).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {topic.masteryLevel}%
                                    </p>
                                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${topic.masteryLevel}%`,
                                                backgroundColor: COLORS[index % COLORS.length],
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Clock size={40} className="mx-auto mb-2 opacity-50" />
                        <p>Start studying to see your topics here!</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ProgressDashboard;
