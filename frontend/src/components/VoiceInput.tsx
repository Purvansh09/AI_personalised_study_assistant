/**
 * VoiceInput Component
 * Microphone button with real-time transcription using Web Speech API
 */

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Mic, MicOff, X } from 'lucide-react';
import React from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceInputProps {
    onTranscriptComplete: (transcript: string) => void;
    disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
    onTranscriptComplete,
    disabled = false,
}) => {
    const {
        isListening,
        transcript,
        interimTranscript,
        error,
        isSupported,
        startListening,
        stopListening,
        resetTranscript,
        setTranscript,
    } = useSpeechRecognition();

    // Handle submit transcript
    const handleSubmit = () => {
        if (transcript.trim()) {
            onTranscriptComplete(transcript.trim());
            resetTranscript();
        }
    };

    // Handle cancel
    const handleCancel = () => {
        stopListening();
        resetTranscript();
    };

    // Toggle listening
    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            resetTranscript();
            startListening();
        }
    };

    // If not supported, show message
    if (!isSupported) {
        return (
            <div className="flex items-center gap-2 text-amber-500 text-sm">
                <AlertCircle size={16} />
                <span>Voice input not supported in this browser</span>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Microphone button */}
            <motion.button
                type="button"
                onClick={toggleListening}
                disabled={disabled}
                className={`
          relative p-3 rounded-full transition-all duration-300
          ${isListening
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
                whileTap={{ scale: 0.95 }}
                aria-label={isListening ? 'Stop recording' : 'Start recording'}
            >
                {/* Pulse animation when recording */}
                <AnimatePresence>
                    {isListening && (
                        <>
                            <motion.div
                                className="absolute inset-0 rounded-full bg-red-500"
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            <motion.div
                                className="absolute inset-0 rounded-full bg-red-500"
                                initial={{ scale: 1, opacity: 0.3 }}
                                animate={{ scale: 1.3, opacity: 0 }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                            />
                        </>
                    )}
                </AnimatePresence>

                {isListening ? (
                    <MicOff size={20} className="relative z-10" />
                ) : (
                    <Mic size={20} className="relative z-10" />
                )}
            </motion.button>

            {/* Transcription popover */}
            <AnimatePresence>
                {(isListening || transcript || error) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full right-0 mb-2 w-80 max-w-[90vw]"
                    >
                        <div className="glass rounded-xl p-4 shadow-xl">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {isListening && (
                                        <motion.div
                                            className="w-2 h-2 rounded-full bg-red-500"
                                            animate={{ opacity: [1, 0.5, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        />
                                    )}
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {isListening ? 'Listening...' : 'Transcription'}
                                    </span>
                                </div>
                                <button
                                    onClick={handleCancel}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X size={16} className="text-gray-500" />
                                </button>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-sm mb-3">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Transcript display */}
                            <div className="min-h-[60px] max-h-[120px] overflow-y-auto mb-3">
                                <p className="text-gray-800 dark:text-gray-200 text-sm">
                                    {transcript}
                                    {interimTranscript && (
                                        <span className="text-gray-400 dark:text-gray-500">
                                            {' '}{interimTranscript}
                                        </span>
                                    )}
                                    {!transcript && !interimTranscript && !error && (
                                        <span className="text-gray-400 dark:text-gray-500 italic">
                                            {isListening ? 'Speak now...' : 'No transcript'}
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Editable text area */}
                            {transcript && (
                                <textarea
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    className="w-full p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 
                    focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                    rows={2}
                                    placeholder="Edit transcript..."
                                />
                            )}

                            {/* Action buttons */}
                            {transcript && (
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 py-2 px-3 text-sm font-medium rounded-lg
                      bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                      hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="flex-1 py-2 px-3 text-sm font-medium rounded-lg
                      bg-primary-600 text-white hover:bg-primary-700 
                      transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Check size={16} />
                                        Send
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VoiceInput;
