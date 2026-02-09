import { NextRequest, NextResponse } from 'next/server';
import { processApplicationNotification } from '@/lib/email/processor';

export const dynamic = 'force-dynamic';

// Verify Firebase ID token (simplified)
async function verifyFirebaseToken(authHeader: string | null): Promise<{ uid: string; email: string } | null> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return null;
        }

        return {
            uid: payload.user_id || payload.sub,
            email: payload.email,
        };
    } catch (error) {
        return null;
    }
}

// POST /api/apply/[jobId] - Candidate submits application
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { default: getPrisma } = await import('@/lib/prisma');
        const prisma = getPrisma();
        const { jobId } = await params;

        // Verify the Firebase token
        const authHeader = request.headers.get('Authorization');
        const tokenData = await verifyFirebaseToken(authHeader);

        if (!tokenData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify job exists and is LIVE
        const job = await prisma.jobOpening.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        if (job.status !== 'LIVE') {
            return NextResponse.json(
                { error: 'This job is no longer accepting applications' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { candidate_name, candidate_email, resume_url, github_url, portfolio_url, linkedin_url } = body;

        // Validate required fields
        if (!candidate_name || !candidate_email || !resume_url) {
            return NextResponse.json(
                { error: 'Name, email, and resume are required' },
                { status: 400 }
            );
        }

        // Check if user already applied
        const existingApplication = await prisma.application.findFirst({
            where: {
                job_id: jobId,
                candidate_email: candidate_email,
            },
        });

        if (existingApplication) {
            return NextResponse.json(
                { error: 'You have already applied to this job' },
                { status: 400 }
            );
        }

        const application = await prisma.application.create({
            data: {
                job_id: jobId,
                candidate_name,
                candidate_email,
                resume_url,
                github_url: github_url || null,
                linkedin_url: linkedin_url || null,
                portfolio_url: portfolio_url || null,
            },
            include: {
                job: {
                    select: {
                        title: true,
                        company_name: true,
                        description: true,
                    },
                },
            },
        });

        // --- BACKGROUND TASKS (Fire and Forget) ---
        (async () => {
            try {
                // 1. ATS SCORING
                const { scoreResume, downloadFileAsBuffer } = await import('@/lib/ats/client');
                const { parseJobDescription } = await import('@/lib/ats/client'); // Import here if needed

                let resumeBuffer: Buffer;
                const resumeUrlStr = resume_url as string;

                if (resumeUrlStr.startsWith('/api/file/')) {
                    const fileId = resumeUrlStr.split('/').pop();
                    if (fileId) {
                        const fileRecord = await (prisma as any).file.findUnique({ where: { id: fileId } });
                        if (!fileRecord) throw new Error(`File record not found: ${fileId}`);
                        resumeBuffer = Buffer.from(fileRecord.data);
                    } else {
                        throw new Error('Invalid file URL format');
                    }
                } else {
                    resumeBuffer = await downloadFileAsBuffer(resume_url);
                }

                const urlParts = resume_url.split('/');
                const filename = urlParts[urlParts.length - 1] || 'resume.pdf';

                let jdPayload: string;
                const jobData = application.job as any;
                const hasParsedCriteria = jobData.jd_hard_requirements && jobData.jd_hard_requirements.length > 0;

                if (hasParsedCriteria) {
                    jdPayload = JSON.stringify({
                        hard_requirements: jobData.jd_hard_requirements,
                        preferred_skills: jobData.jd_preferred_skills,
                        skill_normalization: jobData.jd_skill_normalization || {}
                    });
                } else {
                    const jdText = application.job.description || '';
                    if (jdText.length < 10) throw new Error('Skipped: JD too short');
                    const parsedJd = await parseJobDescription(jdText);
                    jdPayload = JSON.stringify(parsedJd);
                }

                console.log(`Processing ATS for app ${application.id}...`);
                const atsResult = await scoreResume(jdPayload, resumeBuffer, filename);

                await prisma.application.update({
                    where: { id: application.id },
                    data: {
                        ats_score: atsResult.score,
                        ats_decision: atsResult.decision,
                        ats_missing_skills: atsResult.missing,
                        ats_reasons: atsResult.reasons,
                    },
                });
                console.log(`ATS score updated for ${application.id}: ${atsResult.score}`);

                // 2. NOTIFICATION
                await processApplicationNotification({
                    applicationId: application.id,
                    candidateName: application.candidate_name,
                    candidateEmail: application.candidate_email,
                    jobTitle: application.job.title,
                    companyName: application.job.company_name,
                    atsScore: atsResult.score,
                    atsDecision: atsResult.decision,
                    atsMissingSkills: atsResult.missing,
                    atsReasons: atsResult.reasons,
                    jobId: jobId,
                    hrUserId: job.created_by,
                });

            } catch (error) {
                console.error(`Background ATS/Notification error for app ${application.id}:`, error);
            }
        })();

        // 3. SOCIAL CHECK (Separate Background Task)
        if (body.linkedin_url) {
            (async () => {
                try {
                    console.log(`Starting social check for ${body.linkedin_url}...`);
                    const { scrapeLinkedIn } = await import('@/lib/social-scraper');
                    const { analyzeText } = await import('@/lib/text-analyzer');

                    // Parse Username
                    let username = body.linkedin_url;
                    try {
                        const urlStr = body.linkedin_url.startsWith('http') ? body.linkedin_url : `https://${body.linkedin_url}`;
                        const urlObj = new URL(urlStr);
                        const parts = urlObj.pathname.split('/').filter(p => p);
                        if (parts.length > 0) {
                            const inIndex = parts.indexOf('in');
                            if (inIndex !== -1 && inIndex + 1 < parts.length) {
                                username = parts[inIndex + 1];
                            } else {
                                username = parts[parts.length - 1];
                            }
                        }
                    } catch (e) {
                        username = body.linkedin_url.replace(/\/$/, '');
                    }

                    const scrapeResult = await scrapeLinkedIn(username, 5);
                    const posts = scrapeResult.posts;
                    const profile = scrapeResult.profile;

                    if (posts && posts.length > 0) {
                        let totalProfane = 0;
                        let toxicitySum = 0;
                        const analyzedPosts: any[] = [];

                        posts.forEach(post => {
                            const analysis = analyzeText(post.text);
                            analyzedPosts.push({ text: post.text, toxicity: analysis.toxicity });
                            totalProfane += analysis.profane_words;
                            toxicitySum += analysis.toxicity.toxicity;
                        });

                        const avgToxicity = toxicitySum / Math.max(1, analyzedPosts.length);
                        let harassmentRisk = 'Low';
                        if (avgToxicity > 0.6) harassmentRisk = 'High';
                        else if (avgToxicity > 0.3) harassmentRisk = 'Medium';

                        const totalWords = analyzedPosts.reduce((acc, p) => acc + p.text.split(' ').length, 0);
                        const profaneRatio = totalProfane / Math.max(1, totalWords);

                        const socialReport = {
                            username,
                            platform: 'linkedin',
                            profile: profile,
                            total_posts_analyzed: analyzedPosts.length,
                            profane_ratio: parseFloat(profaneRatio.toFixed(2)),
                            average_toxicity: parseFloat(avgToxicity.toFixed(2)),
                            harassment_risk: harassmentRisk,
                            posts: analyzedPosts,
                            comments_analysis: null as any
                        };

                        // 4. Scrape & Analyze Comments
                        try {
                            const { scrapeLinkedInComments } = await import('@/lib/social-scraper');
                            console.log(`Scraping comments for ${username}...`);
                            const comments = await scrapeLinkedInComments(username, 5);

                            if (comments && comments.length > 0) {
                                let commentProfane = 0;
                                let commentToxicitySum = 0;
                                const analyzedComments: any[] = [];

                                comments.forEach(comment => {
                                    const analysis = analyzeText(comment.text);
                                    analyzedComments.push({ text: comment.text, toxicity: analysis.toxicity });
                                    commentProfane += analysis.profane_words;
                                    commentToxicitySum += analysis.toxicity.toxicity;
                                });

                                const avgCommentToxicity = commentToxicitySum / Math.max(1, analyzedComments.length);
                                const totalCommentWords = analyzedComments.reduce((acc, c) => acc + c.text.split(' ').length, 0);
                                const commentProfaneRatio = commentProfane / Math.max(1, totalCommentWords);

                                socialReport.comments_analysis = {
                                    total_comments_analyzed: analyzedComments.length,
                                    average_toxicity: parseFloat(avgCommentToxicity.toFixed(2)),
                                    profane_ratio: parseFloat(commentProfaneRatio.toFixed(2)),
                                    comments: analyzedComments
                                };
                            }
                        } catch (commentErr) {
                            console.error("Comment scraping failed:", commentErr);
                        }

                        await prisma.application.update({
                            where: { id: application.id },
                            data: { social_data: socialReport as any }
                        });
                        console.log(`Social check saved for application ${application.id}`);
                    } else if (profile && profile.name) {
                        // Profile found but no posts
                        await prisma.application.update({
                            where: { id: application.id },
                            data: {
                                social_data: {
                                    platform: 'linkedin',
                                    profile: profile,
                                    error: 'No posts available',
                                    harassment_risk: 'Unknown'
                                } as any
                            }
                        });
                        console.log(`Social check: No posts found for ${username}`);
                    } else {
                        // User not found or private
                        await prisma.application.update({
                            where: { id: application.id },
                            data: {
                                social_data: {
                                    platform: 'linkedin',
                                    error: 'User not found',
                                    harassment_risk: 'Unknown'
                                } as any
                            }
                        });
                        console.log(`Social check: User not found for ${username}`);
                    }
                } catch (err) {
                    console.error('Social check background task failed:', err);
                    // Save generic error state
                    try {
                        const { default: getPrisma } = await import('@/lib/prisma');
                        const prisma = getPrisma();
                        await prisma.application.update({
                            where: { id: application.id },
                            data: {
                                social_data: {
                                    platform: 'linkedin',
                                    error: 'Analysis failed',
                                    harassment_risk: 'Unknown'
                                } as any
                            }
                        });
                    } catch (e) { }
                }
            })();
        }

        return NextResponse.json({ application }, { status: 201 });

    } catch (error: any) {
        console.error('Apply error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
