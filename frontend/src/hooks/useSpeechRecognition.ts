/**
 * useSpeechRecognition Hook
 * Web Speech API integration for voice input
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechRecognitionReturn {
    // State
    isListening: boolean;
    transcript: string;
    interimTranscript: string;
    error: string | null;
    isSupported: boolean;

    // Actions
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    setTranscript: (text: string) => void;
}

// Browser Speech Recognition types
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

type SpeechRecognitionType = new () => {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    start: () => void;
    stop: () => void;
    abort: () => void;
};

// Get browser SpeechRecognition
const getSpeechRecognition = (): SpeechRecognitionType | null => {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: SpeechRecognitionType }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionType }).webkitSpeechRecognition;

    return SpeechRecognition || null;
};

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null);
    const SpeechRecognition = getSpeechRecognition();
    const isSupported = !!SpeechRecognition;

    // Initialize recognition
    useEffect(() => {
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            console.log('🎤 Speech recognition started');
        };

        recognition.onend = () => {
            setIsListening(false);
            console.log('🎤 Speech recognition ended');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interimText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimText += result[0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript((prev) => prev + ' ' + finalTranscript.trim());
            }
            setInterimTranscript(interimText);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);

            switch (event.error) {
                case 'not-allowed':
                    setError('Microphone access denied. Please allow microphone permissions.');
                    break;
                case 'no-speech':
                    setError('No speech detected. Please try again.');
                    break;
                case 'network':
                    setError('Network error. Please check your connection.');
                    break;
                case 'audio-capture':
                    setError('No microphone found. Please connect a microphone.');
                    break;
                default:
                    setError(`Speech recognition error: ${event.error}`);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.abort();
        };
    }, [SpeechRecognition]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) {
            setError('Speech recognition not supported in this browser');
            return;
        }

        setError(null);
        setInterimTranscript('');

        try {
            recognitionRef.current.start();
        } catch (err) {
            // Might already be listening
            console.log('Recognition already started');
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            // Move interim to final transcript
            setTranscript((prev) => {
                const combined = prev + ' ' + interimTranscript;
                return combined.trim();
            });
            setInterimTranscript('');
        }
    }, [interimTranscript]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setError(null);
    }, []);

    return {
        isListening,
        transcript: transcript.trim(),
        interimTranscript,
        error,
        isSupported,
        startListening,
        stopListening,
        resetTranscript,
        setTranscript,
    };
}
