
import { NextRequest, NextResponse } from 'next/server';
import { scrapeTwitter, scrapeLinkedIn, SocialPost } from '@/lib/social-scraper';
import { analyzeText, TextAnalysisResult } from '@/lib/text-analyzer';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { platform, username } = body;

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        if (!platform || !['twitter', 'linkedin'].includes(platform)) {
            return NextResponse.json({ error: 'Platform must be twitter or linkedin' }, { status: 400 });
        }

        // 1. Scrape
        let posts: SocialPost[] = [];
        if (platform === 'twitter') {
            posts = await scrapeTwitter(username);
            // } else {
            //    posts = await scrapeLinkedIn(username);
            // }
        }

        let profileData = {};

        if (platform === 'linkedin') {
            const result = await scrapeLinkedIn(username);
            posts = result.posts;
            profileData = result.profile;
        }

        if (!posts || posts.length === 0) {
            return NextResponse.json({
                error: 'No posts found or scraping failed. Note: LinkedIn scraping requires public visibility.',
                username
            }, { status: 404 });
        }

        // 2. Analyze
        let totalProfane = 0;
        let toxicitySum = 0;
        const analyzedPosts: TextAnalysisResult[] = [];

        posts.forEach(post => {
            const analysis = analyzeText(post.text);
            analyzedPosts.push(analysis);

            totalProfane += analysis.profane_words;
            toxicitySum += analysis.toxicity.toxicity;
        });

        // 3. Aggregate Report
        const avgToxicity = toxicitySum / analyzedPosts.length;
        let harassmentRisk = 'Low';
        if (avgToxicity > 0.6) harassmentRisk = 'High';
        else if (avgToxicity > 0.3) harassmentRisk = 'Medium';

        // Calculate total word count roughly
        const totalWords = analyzedPosts.reduce((acc, p) => acc + p.text.split(' ').length, 0);
        const profaneRatio = totalProfane / Math.max(1, totalWords);

        const report = {
            username,
            platform,
            profile: profileData,
            total_posts_analyzed: analyzedPosts.length,
            profane_ratio: parseFloat(profaneRatio.toFixed(2)),
            average_toxicity: parseFloat(avgToxicity.toFixed(2)),
            harassment_risk: harassmentRisk,
            posts: analyzedPosts.map(p => ({
                text: p.text.substring(0, 100) + '...', // Truncate for response
                toxicity: p.toxicity
            }))
        };

        return NextResponse.json(report);

    } catch (error: any) {
        console.error('Social Check API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// Set max duration for Vercel (scrapers take time)
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic';
