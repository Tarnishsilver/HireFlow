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

        // Create application
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

        // Score resume with ATS API (non-blocking)
        try {
            const { scoreResume, downloadFileAsBuffer } = await import('@/lib/ats/client');

            let resumeBuffer: Buffer;
            const resumeUrlStr = resume_url as string;

            // Check if resume is stored in DB (local API URL)
            if (resumeUrlStr.startsWith('/api/file/')) {
                const fileId = resumeUrlStr.split('/').pop();
                if (fileId) {
                    // Fetch directly from DB to avoid HTTP loopback issues
                    // Cast to any because File types might not be generated yet (dev server lock)
                    const fileRecord = await (prisma as any).file.findUnique({
                        where: { id: fileId },
                    });

                    if (!fileRecord) {
                        throw new Error(`File record not found: ${fileId}`);
                    }
                    resumeBuffer = Buffer.from(fileRecord.data);
                } else {
                    throw new Error('Invalid file URL format');
                }
            } else {
                // Download from external URL (e.g. legacy Firebase)
                resumeBuffer = await downloadFileAsBuffer(resume_url);
            }

            // Extract filename from URL or use default
            const urlParts = resume_url.split('/');
            const filename = urlParts[urlParts.length - 1] || 'resume.pdf';



            // PREPARE JD PAYLOAD FOR SCORING
            // The /score endpoint expects specific JSON structure in the 'jd' field
            let jdPayload: string;

            // 1. Check if we have pre-parsed criteria in the DB
            // Cast to any to access additional fields that might not be in the initial select type inference
            const jobData = application.job as any;
            const hasParsedCriteria = jobData.jd_hard_requirements && jobData.jd_hard_requirements.length > 0;

            if (hasParsedCriteria) {
                console.log('Using pre-parsed JD criteria from DB');
                jdPayload = JSON.stringify({
                    hard_requirements: jobData.jd_hard_requirements,
                    preferred_skills: jobData.jd_preferred_skills,
                    skill_normalization: jobData.jd_skill_normalization || {}
                });
            } else {
                // 2. Fallback: Parse the raw text now if DB fields are empty
                const jdText = application.job.description || '';

                if (jdText.length < 10) {
                    console.warn(`Skipping ATS scoring: Job Description too short (${jdText.length} chars).`);
                    // Throw specific error to be caught below
                    throw new Error('Skipped: JD too short');
                }

                console.log('Parsing raw JD text on-the-fly...');
                // Import parse function
                const { parseJobDescription } = await import('@/lib/ats/client');
                const parsedJd = await parseJobDescription(jdText);

                // Save back to DB for future caching (optional but good practice)
                // await prisma.jobOpening.update(...) - skipping to avoid side effects in this transaction

                jdPayload = JSON.stringify(parsedJd);
            }

            console.log('--- START ATS SCORING DEBUG ---');
            console.log(`Job ID: ${jobId}`);
            console.log(`JD Source: ${hasParsedCriteria ? 'DB Cache' : 'Live Parse'}`);
            console.log(`JD Payload Length: ${jdPayload.length}`);
            console.log(`Resume Buffer Size: ${resumeBuffer.length} bytes`);

            // Score the resume
            const atsResult = await scoreResume(
                jdPayload, // Send the JSON string, not raw text!
                resumeBuffer,
                filename
            );

            console.log('ATS Result:', JSON.stringify(atsResult, null, 2));
            console.log('--- END ATS SCORING DEBUG ---');

            // Update application with ATS scoring results
            await prisma.application.update({
                where: { id: application.id },
                data: {
                    ats_score: atsResult.score,
                    ats_decision: atsResult.decision,
                    ats_missing_skills: atsResult.missing,
                    ats_reasons: atsResult.reasons,
                },
            });

            console.log(`ATS resume scoring successful for application ${application.id}: ${atsResult.score}`);

            // Trigger automated email notification (non-blocking)
            // We don't await this so the user gets a faster response
            processApplicationNotification({
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
            }).catch(err => console.error('Background notification error:', err));
        } catch (atsError: any) {
            // Log error but don't fail application submission
            console.error('--- ATS SCORING FAILED ---');
            console.error('Error Message:', atsError.message);
            if (atsError.response) {
                // Try to log response body if available (depends on client implementation)
                console.error('Response Status:', atsError.response.status);
            }
            console.error('Stack:', atsError.stack);
            console.error('--------------------------');
        }

        // --- SOCIAL CHECK (Non-blocking) ---
        if (body.linkedin_url) {
            (async () => {
                try {
                    console.log(`Starting social check task for ${body.linkedin_url}...`);

                    // Dynamic imports to keep the main thread light
                    const { scrapeLinkedIn } = await import('@/lib/social-scraper');
                    const { analyzeText } = await import('@/lib/text-analyzer');

                    // 1. Parse Username
                    let username = body.linkedin_url;
                    try {
                        const urlStr = body.linkedin_url.startsWith('http') ? body.linkedin_url : `https://${body.linkedin_url}`;
                        const urlObj = new URL(urlStr);
                        const parts = urlObj.pathname.split('/').filter(p => p);
                        if (parts.length > 0) {
                            // Handle /in/username vs just username
                            const inIndex = parts.indexOf('in');
                            if (inIndex !== -1 && inIndex + 1 < parts.length) {
                                username = parts[inIndex + 1];
                            } else {
                                // invalid or raw username path
                                username = parts[parts.length - 1];
                            }
                        }
                    } catch (e) {
                        // Not a valid URL, assume the input is the username itself
                        username = body.linkedin_url.replace(/\/$/, ''); // remove trailing slash
                    }

                    console.log(`Extracted LinkedIn username: ${username}`);

                    // 2. Scrape Data
                    // We use the same scraper function as the separate tool
                    const posts = await scrapeLinkedIn(username, 5); // Limit to 5 for compatibility

                    if (posts && posts.length > 0) {
                        // 3. Analyze Data
                        let totalProfane = 0;
                        let toxicitySum = 0;
                        const analyzedPosts: any[] = [];

                        posts.forEach(post => {
                            const analysis = analyzeText(post.text);

                            // Store full text in DB for HR review, unlike the API which truncates
                            analyzedPosts.push({
                                text: post.text,
                                toxicity: analysis.toxicity
                            });

                            totalProfane += analysis.profane_words;
                            toxicitySum += analysis.toxicity.toxicity;
                        });

                        // 4. Generate Report
                        const avgToxicity = toxicitySum / Math.max(1, analyzedPosts.length);
                        let harassmentRisk = 'Low';
                        if (avgToxicity > 0.6) harassmentRisk = 'High';
                        else if (avgToxicity > 0.3) harassmentRisk = 'Medium';

                        // Calculate total word count roughly
                        const totalWords = analyzedPosts.reduce((acc, p) => acc + p.text.split(' ').length, 0);
                        const profaneRatio = totalProfane / Math.max(1, totalWords);

                        const socialReport = {
                            username,
                            platform: 'linkedin',
                            total_posts_analyzed: analyzedPosts.length,
                            profane_ratio: parseFloat(profaneRatio.toFixed(2)),
                            average_toxicity: parseFloat(avgToxicity.toFixed(2)),
                            harassment_risk: harassmentRisk,
                            posts: analyzedPosts
                        };

                        // 5. Store in DB
                        // We update the application record with this json data
                        await prisma.application.update({
                            where: { id: application.id },
                            data: { social_data: socialReport as any }
                        });
                        console.log(`Social check saved for application ${application.id}`);
                    } else {
                        console.log(`No LinkedIn posts found for ${username}, skipping social data save.`);
                    }

                } catch (socialError) {
                    // Fail silently for the user, but log for admin
                    console.error('Social check background task failed:', socialError);
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
