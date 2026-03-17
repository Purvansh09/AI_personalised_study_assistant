/**
 * Main App Component
 * Routes, layout, and theme management
 */

import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, LogOut, MessageSquare, Moon, Settings, Sparkles, Sun } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { LearningStyleQuiz } from './components/LearningStyleQuiz';
import { ProgressDashboard } from './components/ProgressDashboard';
import { AuthPages } from './pages/AuthPages';
import { useUserStore } from './store/userStore';

type ActiveView = 'chat' | 'progress' | 'settings';

const App: React.FC = () => {
    const {
        isAuthenticated,
        hasCompletedOnboarding,
        theme,
        toggleTheme,
        logout,
        user,
        learningProfile,
    } = useUserStore();

    const [showQuiz, setShowQuiz] = useState(false);
    const [activeView, setActiveView] = useState<ActiveView>('chat');

    // Apply theme on mount
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Handle auth success
    const handleAuthSuccess = (hasOnboarding: boolean) => {
        if (!hasOnboarding) {
            setShowQuiz(true);
        }
    };

    // Handle quiz complete
    const handleQuizComplete = () => {
        setShowQuiz(false);
    };

    // Not authenticated - show auth pages
    if (!isAuthenticated) {
        return <AuthPages onAuthSuccess={handleAuthSuccess} />;
    }

    // Show onboarding quiz if not completed
    if (showQuiz || !hasCompletedOnboarding) {
        return <LearningStyleQuiz onComplete={handleQuizComplete} />;
    }

    // Main authenticated app
    return (
        <div className="h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            {/* Sidebar navigation */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-20 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-6"
            >
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-8 shadow-lg shadow-primary-500/25">
                    <Sparkles size={24} className="text-white" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col items-center gap-2">
                    <NavButton
                        icon={<MessageSquare size={22} />}
                        isActive={activeView === 'chat'}
                        onClick={() => setActiveView('chat')}
                        tooltip="Chat"
                    />
                    <NavButton
                        icon={<BarChart3 size={22} />}
                        isActive={activeView === 'progress'}
                        onClick={() => setActiveView('progress')}
                        tooltip="Progress"
                    />
                    <NavButton
                        icon={<Settings size={22} />}
                        isActive={activeView === 'settings'}
                        onClick={() => setActiveView('settings')}
                        tooltip="Settings"
                    />
                </nav>

                {/* Bottom actions */}
                <div className="flex flex-col items-center gap-2 mt-auto">
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="p-3 rounded-xl text-gray-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </motion.aside>

            {/* Main content area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeView === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex-1 overflow-hidden"
                        >
                            <ChatInterface />
                        </motion.div>
                    )}

                    {activeView === 'progress' && (
                        <motion.div
                            key="progress"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex-1 overflow-hidden"
                        >
                            <ProgressDashboard />
                        </motion.div>
                    )}

                    {activeView === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex-1 overflow-auto p-6"
                        >
                            <SettingsView />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

// Navigation button component
interface NavButtonProps {
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    tooltip: string;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, isActive, onClick, tooltip }) => (
    <button
        onClick={onClick}
        title={tooltip}
        className={`
      relative p-3 rounded-xl transition-all duration-200
      ${isActive
                ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
            }
    `}
    >
        {icon}
        {isActive && (
            <motion.div
                layoutId="navIndicator"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-l-full"
            />
        )}
    </button>
);

// Settings view component
const SettingsView: React.FC = () => {
    const { user, learningProfile, logout, theme, toggleTheme } = useUserStore();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

            {/* Profile card */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Profile
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl text-white font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Learning style card */}
            {learningProfile && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Learning Style
                    </h2>
                    <div className={`p-4 rounded-xl style-${learningProfile.learningStyle.replace('_', '-')}`}>
                        <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {learningProfile.learningStyle.replace('_', '/')} Learner
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your study content is personalized for your learning style
                        </p>
                    </div>
                </div>
            )}

            {/* Appearance card */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Appearance
                </h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Toggle between light and dark themes
                        </p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`
              relative w-14 h-8 rounded-full transition-colors duration-200
              ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'}
            `}
                    >
                        <motion.div
                            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center"
                            animate={{ left: theme === 'dark' ? '28px' : '4px' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                            {theme === 'dark' ? (
                                <Moon size={14} className="text-primary-600" />
                            ) : (
                                <Sun size={14} className="text-amber-500" />
                            )}
                        </motion.div>
                    </button>
                </div>
            </div>

            {/* Logout button */}
            <button
                onClick={logout}
                className="w-full py-3 px-6 rounded-xl border-2 border-red-500 text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
                Sign Out
            </button>
        </div>
    );
};

export default App;
