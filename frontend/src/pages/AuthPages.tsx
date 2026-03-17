/**
 * Auth Pages Component
 * Login and Registration forms
 */

import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles, User } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import { useUserStore } from '../store/userStore';

interface AuthPagesProps {
    onAuthSuccess: (hasCompletedOnboarding: boolean) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });

    const { setUser, setOnboardingComplete } = useUserStore();

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: () => authApi.login(formData.email, formData.password),
        onSuccess: (data) => {
            setUser(data.user, data.token);
            setOnboardingComplete(data.hasCompletedOnboarding || false);
            toast.success('Welcome back!');
            onAuthSuccess(data.hasCompletedOnboarding || false);
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.');
        },
    });

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: () => authApi.register(formData.email, formData.password, formData.name),
        onSuccess: (data) => {
            setUser(data.user, data.token);
            setOnboardingComplete(false);
            toast.success('Account created successfully!');
            onAuthSuccess(false);
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            loginMutation.mutate();
        } else {
            registerMutation.mutate();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isLoading = loginMutation.isPending || registerMutation.isPending;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative"
            >
                {/* Logo and header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/25"
                    >
                        <Sparkles size={32} className="text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-gray-100">
                        StudyAI
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Your personalized study assistant
                    </p>
                </div>

                {/* Auth card */}
                <div className="card p-8">
                    {/* Tab switcher */}
                    <div className="flex mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isLogin
                                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${!isLogin
                                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            size={20}
                                        />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            required={!isLogin}
                                            className="input pl-10"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={20}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    required
                                    className="input pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={20}
                                />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="input pl-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full mt-6"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : isLogin ? (
                                'Sign In'
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Demo mode: Create an account with any email/password
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    By continuing, you agree to our Terms of Service
                </p>
            </motion.div>
        </div>
    );
};

export default AuthPages;
