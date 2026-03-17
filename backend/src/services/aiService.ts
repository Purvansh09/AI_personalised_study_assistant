/**
 * AI Service
 * Handles integration with OpenAI GPT-4 API for chat functionality
 */

import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { LearningStyle } from '../types';
import { generateSystemPrompt } from './learningStyleService';

const prisma = new PrismaClient();

// Check if API key is configured
const isApiConfigured = (): boolean => {
    return !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key');
};

// Initialize OpenAI client only if API key is present
let openai: OpenAI | null = null;
if (isApiConfigured()) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized');
} else {
    console.log('⚠️ OpenAI API key not configured - running in mock mode');
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * Get chat response from AI with learning style adaptation
 */
export async function getChatResponse(
    userId: string,
    userMessage: string,
    sessionId: string,
    conversationHistory: ChatMessage[] = [],
    documentContext: string = ''
): Promise<string> {
    try {
        // Get user's learning profile
        const learningProfile = await prisma.learningProfile.findUnique({
            where: { userId },
        });

        // Default to visual if no profile found
        const learningStyle: LearningStyle = (learningProfile?.learningStyle as LearningStyle) || 'visual';
        const preferences = learningProfile?.preferences as { preferredDifficulty?: 'beginner' | 'intermediate' | 'advanced' } || {};

        // Generate system prompt based on learning style
        const systemPrompt = generateSystemPrompt(
            learningStyle,
            'general', // Can be made dynamic based on detected topic
            preferences.preferredDifficulty || 'intermediate'
        );

        // If API is not configured, return a mock response
        if (!isApiConfigured()) {
            console.log('⚠️ OpenAI API not configured, returning mock response');
            return getMockResponse(userMessage, learningStyle, documentContext);
        }

        // Add document context to system prompt if available
        let fullSystemPrompt = systemPrompt;
        if (documentContext) {
            fullSystemPrompt += `\n\n--- REFERENCE DOCUMENTS ---\n${documentContext}\n--- END REFERENCE DOCUMENTS ---\n\nWhen answering the user's questions, refer to and cite the above documents when relevant. If the user asks about content in the documents, use the document text to provide accurate answers.`;
        }

        // Build messages array for OpenAI
        const messages: ChatMessage[] = [
            { role: 'system', content: fullSystemPrompt },
            ...conversationHistory.slice(-10), // Keep last 10 messages for context
            { role: 'user', content: userMessage },
        ];

        // Call OpenAI API
        const completion = await openai!.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: messages.map(m => ({
                role: m.role,
                content: m.content,
            })),
            max_tokens: 2000,
            temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content;

        if (!response) {
            throw new Error('No response from AI');
        }

        console.log(`✅ AI response generated for user ${userId} (${learningStyle} learner)`);
        return response;

    } catch (error) {
        console.error('AI Service Error:', error);

        // Handle specific OpenAI errors
        if (error instanceof OpenAI.APIError) {
            if (error.status === 401) {
                return "I'm sorry, there's an issue with the AI configuration. Please check your API key.";
            }
            if (error.status === 429) {
                return "I'm currently experiencing high demand. Please try again in a moment.";
            }
        }

        // Return a helpful fallback message
        return "I apologize, but I'm having trouble processing your request right now. Please try again.";
    }
}

/**
 * Mock response generator for testing without API key
 */
function getMockResponse(userMessage: string, learningStyle: LearningStyle, documentContext: string = ''): string {
    // If document context is provided, generate a document-aware mock response
    if (documentContext) {
        const docPreview = documentContext.slice(0, 200);
        return `📄 **Based on your uploaded documents:**\n\nI've reviewed the document content you provided. Here's what I found relevant to your question:\n\n> "${docPreview}..."\n\n**Key Points from the Document:**\n- The document covers topics related to your question\n- I've identified relevant sections that address "${userMessage.slice(0, 50)}"\n- Based on the document content, here's a summary of the key information\n\n**Analysis:**\nThe document provides valuable context for understanding this topic. The main concepts discussed include the subjects mentioned in the text above.\n\n💡 *This is a demo response with document context. Connect your OpenAI API key for AI-powered analysis of your documents!*`;
    }

    const styleAdaptations: Record<LearningStyle, string> = {
        visual: `📊 **Here's a visual breakdown of your question:**

Let me explain this using a visual approach:

\`\`\`
┌─────────────────────────────────────┐
│     Understanding Your Question     │
├─────────────────────────────────────┤
│  Input: "${userMessage.slice(0, 30)}..."  │
│    ↓                                │
│  Analysis                           │
│    ↓                                │
│  Answer                             │
└─────────────────────────────────────┘
\`\`\`

🔍 **Key Points:**
• First, let's visualize the main concept
• Here's a diagram showing the relationship
• Notice how these elements connect

*This is a demo response. Connect your OpenAI API key for real AI responses!*`,

        auditory: `🎧 **Let me explain this as if we're having a conversation...**

Imagine we're sitting down to discuss this together. Here's how I'd explain it:

"So, you're asking about ${userMessage.slice(0, 50)}..."

Think of it like this - picture yourself explaining it to a friend. You might say:
- "First, think of it as..."
- "Then, you'll hear yourself saying..."
- "Finally, it all clicks when..."

💡 **Remember this phrase:** "When you understand it, you can teach it!"

*This is a demo response. Connect your OpenAI API key for real AI responses!*`,

        kinesthetic: `🛠️ **Let's learn this hands-on!**

Here's a practical approach to understanding your question:

**Try This Activity:**
1. First, grab a piece of paper ✍️
2. Write down the key concept
3. Now, let's break it into steps you can DO

**Hands-On Exercise:**
\`\`\`
Step 1: [Action] → Result
Step 2: [Action] → Result  
Step 3: [Action] → Final Understanding
\`\`\`

🎯 **Practice Challenge:** Try explaining this to someone else using gestures!

*This is a demo response. Connect your OpenAI API key for real AI responses!*`,

        reading_writing: `📝 **Comprehensive Written Explanation**

**Question Analysis:** ${userMessage}

---

**Definition:**
A detailed explanation of the core concept...

**Key Points:**
1. **First Point** - Detailed explanation with context
2. **Second Point** - Supporting information and examples
3. **Third Point** - Additional considerations

**Summary:**
In summary, this topic involves understanding how [concept] relates to [related concept]. For further reading, consider exploring related subjects.

**Notes to Self:**
- Review this explanation
- Write out the key terms
- Create a summary in your own words

*This is a demo response. Connect your OpenAI API key for real AI responses!*`,
    };

    return styleAdaptations[learningStyle];
}

/**
 * Generate practice questions for a topic
 */
export async function generatePracticeQuestions(
    topic: string,
    count: number = 5,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<{ questions: Array<{ question: string; answer: string }> }> {
    if (!isApiConfigured()) {
        // Return mock questions
        return {
            questions: [
                { question: `What is the main concept of ${topic}?`, answer: "Sample answer..." },
                { question: `How does ${topic} apply in real life?`, answer: "Sample answer..." },
                { question: `What are the key components of ${topic}?`, answer: "Sample answer..." },
            ],
        };
    }

    try {
        const completion = await openai!.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: `Generate ${count} practice questions about "${topic}" at ${difficulty} level. Return as JSON array with question and answer fields.`,
                },
                {
                    role: 'user',
                    content: `Generate practice questions for: ${topic}`,
                },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 1500,
        });

        const response = completion.choices[0]?.message?.content;
        return JSON.parse(response || '{"questions": []}');
    } catch (error) {
        console.error('Error generating practice questions:', error);
        return { questions: [] };
    }
}

/**
 * Generate flashcards from a topic
 */
export async function generateFlashcards(
    topic: string,
    count: number = 10
): Promise<Array<{ front: string; back: string }>> {
    if (!isApiConfigured()) {
        return [
            { front: `What is ${topic}?`, back: "Definition here..." },
            { front: `Key feature of ${topic}`, back: "Feature explanation..." },
        ];
    }

    try {
        const completion = await openai!.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: `Generate ${count} flashcards about "${topic}". Return as JSON with a "flashcards" array containing objects with "front" and "back" fields.`,
                },
                {
                    role: 'user',
                    content: `Create flashcards for studying: ${topic}`,
                },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 1500,
        });

        const response = completion.choices[0]?.message?.content;
        const parsed = JSON.parse(response || '{"flashcards": []}');
        return parsed.flashcards || [];
    } catch (error) {
        console.error('Error generating flashcards:', error);
        return [];
    }
}
