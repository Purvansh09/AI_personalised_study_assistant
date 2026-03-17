/**
 * Learning Style Service
 * Handles learning style detection and adaptive prompt generation
 */

import { LearningStyle } from '../types';

// Learning style quiz questions
export const learningStyleQuestions = [
    {
        id: 1,
        question: "When learning something new, I prefer to:",
        options: [
            { text: "Watch a video or look at diagrams", style: "visual" as const, weight: 1 },
            { text: "Listen to an explanation or podcast", style: "auditory" as const, weight: 1 },
            { text: "Try it out hands-on and experiment", style: "kinesthetic" as const, weight: 1 },
            { text: "Read detailed written instructions", style: "reading_writing" as const, weight: 1 },
        ],
    },
    {
        id: 2,
        question: "When I need to remember something, I usually:",
        options: [
            { text: "Picture it in my mind", style: "visual" as const, weight: 1 },
            { text: "Repeat it out loud or say it to myself", style: "auditory" as const, weight: 1 },
            { text: "Write it down or use my hands", style: "kinesthetic" as const, weight: 1 },
            { text: "Read and re-read notes", style: "reading_writing" as const, weight: 1 },
        ],
    },
    {
        id: 3,
        question: "I understand complex ideas better when:",
        options: [
            { text: "They're shown with charts, graphs, or images", style: "visual" as const, weight: 1 },
            { text: "Someone explains them to me verbally", style: "auditory" as const, weight: 1 },
            { text: "I can work through examples myself", style: "kinesthetic" as const, weight: 1 },
            { text: "I can read about them in depth", style: "reading_writing" as const, weight: 1 },
        ],
    },
    {
        id: 4,
        question: "When giving directions, I would:",
        options: [
            { text: "Draw a map or show pictures", style: "visual" as const, weight: 1 },
            { text: "Tell them verbally, step by step", style: "auditory" as const, weight: 1 },
            { text: "Walk with them or point the way", style: "kinesthetic" as const, weight: 1 },
            { text: "Write down the instructions", style: "reading_writing" as const, weight: 1 },
        ],
    },
    {
        id: 5,
        question: "I get distracted most by:",
        options: [
            { text: "Visual clutter or movement", style: "visual" as const, weight: 1 },
            { text: "Sounds, noises, or music", style: "auditory" as const, weight: 1 },
            { text: "Physical discomfort or urge to move", style: "kinesthetic" as const, weight: 1 },
            { text: "Poor writing or formatting", style: "reading_writing" as const, weight: 1 },
        ],
    },
    {
        id: 6,
        question: "When studying for an exam, I prefer to:",
        options: [
            { text: "Review diagrams, flashcards with images", style: "visual" as const, weight: 1 },
            { text: "Discuss topics with others or record myself", style: "auditory" as const, weight: 1 },
            { text: "Practice problems or use physical models", style: "kinesthetic" as const, weight: 1 },
            { text: "Re-read textbooks and rewrite notes", style: "reading_writing" as const, weight: 1 },
        ],
    },
    {
        id: 7,
        question: "I would describe my ideal learning environment as:",
        options: [
            { text: "Visually organized with color-coded materials", style: "visual" as const, weight: 1 },
            { text: "Quiet for listening or with background music", style: "auditory" as const, weight: 1 },
            { text: "Space to move around and be active", style: "kinesthetic" as const, weight: 1 },
            { text: "A library with lots of reading material", style: "reading_writing" as const, weight: 1 },
        ],
    },
];

/**
 * Calculate learning style from quiz answers
 */
export function calculateLearningStyle(answers: { questionId: number; selectedOption: number }[]): {
    primaryStyle: LearningStyle;
    scores: Record<LearningStyle, number>;
} {
    const scores: Record<LearningStyle, number> = {
        visual: 0,
        auditory: 0,
        kinesthetic: 0,
        reading_writing: 0,
    };

    // Calculate scores based on answers
    answers.forEach(answer => {
        const question = learningStyleQuestions.find(q => q.id === answer.questionId);
        if (question && question.options[answer.selectedOption]) {
            const option = question.options[answer.selectedOption];
            scores[option.style] += option.weight;
        }
    });

    // Find primary learning style
    const primaryStyle = (Object.entries(scores) as [LearningStyle, number][])
        .sort((a, b) => b[1] - a[1])[0][0];

    return {
        primaryStyle,
        scores,
    };
}

/**
 * Generate learning style-specific system prompts
 */
export function getLearningStylePrompt(style: LearningStyle): string {
    const prompts: Record<LearningStyle, string> = {
        visual: `You are a study assistant helping a VISUAL learner. Adapt your responses by:
- Using diagrams, charts, and visual representations (ASCII art when possible)
- Including step-by-step visual breakdowns
- Using bullet points and organized layouts
- Incorporating color coding suggestions and visual metaphors
- Creating mental imagery through descriptive language
- Using tables to organize information
Example visual representation:
\`\`\`
   [Input] → [Process] → [Output]
      ↓          ↓          ↓
   Data      Transform   Result
\`\`\``,

        auditory: `You are a study assistant helping an AUDITORY learner. Adapt your responses by:
- Using conversational, dialogue-style explanations
- Including memorable phrases, rhymes, and mnemonics
- Suggesting verbal strategies like "say it out loud"
- Using analogies and storytelling
- Explaining concepts as if having a discussion
- Creating rhythmic patterns for memorization
- Recommending podcast-style learning approaches
Example: "Think of it like a conversation between two friends..."`,

        kinesthetic: `You are a study assistant helping a KINESTHETIC learner. Adapt your responses by:
- Providing hands-on activities and practical exercises
- Breaking down concepts into actionable steps
- Using real-world, tangible examples
- Including "try this" experiments and activities
- Relating concepts to physical sensations or movements
- Suggesting practice problems and interactive exercises
- Using action verbs and describing processes as movements
Example: "Let's build this step by step. First, try writing out..."`,

        reading_writing: `You are a study assistant helping a READING/WRITING learner. Adapt your responses by:
- Providing detailed, well-structured written explanations
- Using lists, definitions, and written summaries
- Including quotes and textual references
- Organizing information with clear headings and subheadings
- Suggesting note-taking strategies
- Providing written examples and detailed descriptions
- Recommending readings and written resources
Example with structured format:

**Definition:** [Clear definition here]
**Key Points:**
1. First important point
2. Second important point

**Summary:** [Concise summary paragraph]`,
    };

    return prompts[style];
}

/**
 * Get subject-specific expertise prompt
 */
export function getSubjectPrompt(subject: string): string {
    const subjects: Record<string, string> = {
        math: "You have deep expertise in mathematics including algebra, calculus, geometry, statistics, and problem-solving. Show step-by-step solutions.",
        science: "You have expertise in natural sciences including physics, chemistry, and biology. Explain scientific concepts clearly with examples.",
        programming: "You are an expert programmer. Explain code concepts clearly, provide working examples, and follow best practices.",
        history: "You are knowledgeable in world history and can explain historical events, their causes, and consequences contextually.",
        language: "You are skilled in language learning and can explain grammar, vocabulary, and communication skills effectively.",
        general: "You are a knowledgeable study assistant who can help with various academic subjects.",
    };

    return subjects[subject.toLowerCase()] || subjects.general;
}

/**
 * Generate full system prompt combining learning style and subject
 */
export function generateSystemPrompt(
    learningStyle: LearningStyle,
    subject: string = 'general',
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): string {
    const learningStylePrompt = getLearningStylePrompt(learningStyle);
    const subjectPrompt = getSubjectPrompt(subject);

    const difficultyGuide = {
        beginner: "Explain concepts simply, avoid jargon, and use basic examples.",
        intermediate: "Balance depth with clarity, introduce some technical terms with explanations.",
        advanced: "Provide in-depth explanations, use technical terminology, and explore complex nuances.",
    };

    return `${learningStylePrompt}

${subjectPrompt}

Difficulty Level: ${difficulty.toUpperCase()}
${difficultyGuide[difficulty]}

Additional Guidelines:
- Be encouraging and supportive
- Break down complex topics into manageable parts
- Offer to explain further if needed
- Provide practice opportunities when relevant
- End responses with engagement prompts or follow-up questions when appropriate`;
}
