export interface Question {
    id: string;
    text: string;
    category: 'Behavioral' | 'Technical' | 'System Design' | 'Situational';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    durationSeconds: number;
}

export const MOCK_QUESTIONS: Question[] = [
    {
        id: 'q1',
        text: "Tell me about a time you had to manage a conflict within your team.",
        category: 'Behavioral',
        difficulty: 'Medium',
        durationSeconds: 120
    },
    {
        id: 'q2',
        text: "Explain the concept of closure in JavaScript. How is it used?",
        category: 'Technical',
        difficulty: 'Easy',
        durationSeconds: 180
    },
    {
        id: 'q3',
        text: "Design a scalable rate limiter for a public API.",
        category: 'System Design',
        difficulty: 'Hard',
        durationSeconds: 600
    },
    {
        id: 'q4',
        text: "How would you handle a sudden production outage?",
        category: 'Situational',
        difficulty: 'Medium',
        durationSeconds: 300
    }
];
