

import Sentiment from 'sentiment';
import { Filter } from 'bad-words';

const sentiment = new Sentiment();
const filter = new Filter();

export interface TextAnalysisResult {
    text: string;
    toxicity: {
        toxicity: number; // 0 to 1, derived from sentiment
        severe_toxicity: number; // 0 (placeholder as simple sentiment doesn't distinguish)
        obscene: number; // 0 or 1 based on profanity
        threat: number; // 0 (placeholder)
        insult: number; // 0 (placeholder)
        identity_attack: number; // 0 (placeholder)
    };
    profane_words: number;
}

export function cleanText(text: string): string {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/http\S+/g, '') // URLs
        .replace(/@\w+/g, '')    // Mentions
        .replace(/#\w+/g, '')    // Hashtags
        .replace(/[^a-zA-Z\s]/g, '') // Special chars
        .replace(/\s+/g, ' ')    // Extra whitespace
        .trim();
}

export function analyzeText(text: string): TextAnalysisResult {
    const cleaned = cleanText(text);

    // Sentiment score: usually -5 to +5. 
    // We map it to a "toxicity" score where negative sentiment = higher toxicity.
    // -5 -> 1.0 (very toxic), 0 -> 0.5, +5 -> 0.0 (not toxic)
    const sentimentResult = sentiment.analyze(cleaned);
    const normalizedScore = Math.max(-5, Math.min(5, sentimentResult.score));
    // Invert: higher score (positive) -> lower toxicity.
    // Range [-5, 5] -> [0, 10]. Reverse: 10 - (score + 5) -> [10, 0]. Divide by 10.
    let toxicityScore = (5 - normalizedScore) / 10;

    // Profanity check
    const isProfane = filter.isProfane(cleaned);
    let profaneCount = 0;
    // Simple word count for profanity (approximate)
    const words = cleaned.split(' ');
    words.forEach(w => {
        if (filter.isProfane(w)) profaneCount++;
    });

    // Boost toxicity if profane
    if (isProfane) {
        toxicityScore = Math.min(1.0, toxicityScore + 0.3);
    }

    return {
        text: cleaned,
        toxicity: {
            toxicity: parseFloat(toxicityScore.toFixed(2)),
            severe_toxicity: 0, // Not available with simple sentiment
            obscene: isProfane ? 1 : 0,
            threat: 0,
            insult: 0,
            identity_attack: 0
        },
        profane_words: profaneCount
    };
}
