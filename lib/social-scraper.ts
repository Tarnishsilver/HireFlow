
// Imports moved to dynamic imports inside getBrowser
// import puppeteer from 'puppeteer-core';
// import chromium from '@sparticuz/chromium';
// We'll import the local puppeteer dynamically to avoid bundling issues in Vercel if possible,
// or just rely on the conditional logic. 

// Define types for scraped data
export interface SocialPost {
    text: string;
    created_at: string;
    source: 'twitter' | 'linkedin';
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function getBrowser() {
    let browser;

    if (IS_PRODUCTION) {
        // Vercel / Production Environment
        try {
            const chromium = (await import('@sparticuz/chromium')).default;
            const puppeteerCore = (await import('puppeteer-core')).default;

            browser = await puppeteerCore.launch({
                args: chromium.args,
                defaultViewport: (chromium as any).defaultViewport,
                executablePath: await chromium.executablePath(
                    "https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar"
                ),
                headless: (chromium as any).headless,
            });
        } catch (error) {
            console.error("Production browser launch failed:", error);
            throw error;
        }
    } else {
        // Local Development
        try {
            const puppeteerLocal = (await import('puppeteer')).default;
            browser = await puppeteerLocal.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        } catch (e) {
            console.warn("Local puppeteer launch failed, trying fallback...", e);
            throw new Error("Could not launch local browser. Ensure 'puppeteer' is installed.");
        }
    }
    return browser;
}

export async function scrapeTwitter(username: string, limit: number = 10): Promise<SocialPost[]> {
    const browser = await getBrowser();
    const posts: SocialPost[] = [];

    try {
        const page = await browser.newPage();
        // Stealth/Anti-detection scripts
        await page.evaluateOnNewDocument(() => {
            // @ts-ignore
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });

        const url = `https://x.com/${username}`;
        console.log(`Navigating to ${url}`);

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Quick check for redirect or error
        const title = await page.title();
        if (title.includes("Example Domain")) { // Fallback check
            console.error("Failed to load X.com");
            return [];
        }

        // Scroll and scrape
        let lastHeight = 0;
        let attempts = 0;

        while (posts.length < limit && attempts < 5) {
            // Wait for tweets
            try {
                await page.waitForSelector('article[data-testid="tweet"]', { timeout: 5000 });
            } catch (e) {
                console.log("Waiting for tweets...");
            }

            const tweetElements = await page.$$('article[data-testid="tweet"]');

            for (const element of tweetElements) {
                if (posts.length >= limit) break;

                try {
                    const textEl = await element.$('[data-testid="tweetText"]');
                    const timeEl = await element.$('time');

                    if (textEl) {
                        const text = await (await textEl.getProperty('innerText')).jsonValue() as string;
                        let created_at = new Date().toISOString();

                        if (timeEl) {
                            const timeVal = await (await timeEl.getProperty('datetime')).jsonValue();
                            if (timeVal) created_at = timeVal as string;
                        }

                        // Dedup
                        if (!posts.some(p => p.text === text)) {
                            posts.push({ text, created_at, source: 'twitter' });
                        }
                    }
                } catch (err) {
                    continue;
                }
            }

            // Scroll
            lastHeight = await page.evaluate('document.body.scrollHeight') as number;
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await new Promise(r => setTimeout(r, 2000));

            const newHeight = await page.evaluate('document.body.scrollHeight') as number;
            if (newHeight === lastHeight) {
                attempts++;
            } else {
                attempts = 0; // Reset if we moved
            }
        }

    } catch (error) {
        console.error("Twitter scrape error:", error);
    } finally {
        await browser.close();
    }

    return posts;
}

export async function scrapeLinkedIn(username: string, limit: number = 10): Promise<SocialPost[]> {
    // Similar logic for LinkedIn, simplified
    // Note: LinkedIn scraping is very hard without cookies/auth. 
    // We will try public profile scraping similar to the python script.
    const browser = await getBrowser();
    const posts: SocialPost[] = [];

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });

        // Authenticate with Cookie if available
        if (process.env.LI_AT_COOKIE) {
            console.log("Injecting LinkedIn 'li_at' cookie...");
            await page.setCookie({
                name: 'li_at',
                value: process.env.LI_AT_COOKIE,
                domain: '.linkedin.com',
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            });
        }

        // Public activity URL
        const url = `https://www.linkedin.com/in/${username}/recent-activity/all/`;
        console.log(`Navigating to ${url}`);

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Check for auth wall
        const currentUrl = page.url();
        if (currentUrl.includes("auth_wall") || currentUrl.includes("login")) {
            console.warn("LinkedIn Auth Wall detected.");
            // Try fallback to public profile if activity fails? 
            // For now, return empty or what we found.
        }

        await new Promise(r => setTimeout(r, 3000));

        // Selectors
        // Wait for potential content
        try {
            await page.waitForSelector('main', { timeout: 5000 });
        } catch (e) { }

        // Try to identify posts
        // LinkedIn public profile activity selectors are tricky and dynamic.
        // We look for article, or li elements that look like updates.
        const possibleSelectors = [
            '.feed-shared-update-v2',
            'li.profile-creator-shared-feed-update__container',
            'div.attribution-activity-output',
            'article',
            '.occludable-update'
        ];

        let attempts = 0;
        while (posts.length < limit && attempts < 5) {
            // Get all candidate elements from all selectors
            const elements = await page.$$(possibleSelectors.join(', '));
            console.log(`Found ${elements.length} potential post elements on attempt ${attempts + 1}`);

            for (const element of elements) {
                if (posts.length >= limit) break;
                try {
                    // Try multiple selectors for text within the post
                    let text = '';

                    // We try to get text from specific description parts first, then fall back to the whole element
                    const textEl = await element.$('.feed-shared-update-v2__description-wrapper, .feed-shared-text, .update-components-text, span.break-words');

                    if (textEl) {
                        text = await (await textEl.getProperty('innerText')).jsonValue() as string;
                    } else {
                        // Fallback: get text of the whole container but this might be noisy
                        text = await (await element.getProperty('innerText')).jsonValue() as string;
                    }

                    text = text.trim();

                    // Basic cleanup: remove "Like", "Comment", generic UI text if possible. 
                    // But for now, just checking length is a decent heuristic.
                    if (text.length > 20 && !posts.some(p => p.text === text)) {
                        posts.push({
                            text: text.slice(0, 500), // Truncate for safety
                            created_at: new Date().toISOString(),
                            source: 'linkedin'
                        });
                    }
                } catch (e) { continue; }
            }

            if (posts.length >= limit) break;

            // Scroll down
            const previousHeight = await page.evaluate('document.body.scrollHeight');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await new Promise(r => setTimeout(r, 2000));
            const newHeight = await page.evaluate('document.body.scrollHeight');

            if ((newHeight as number) === (previousHeight as number)) {
                attempts++;
            } else {
                attempts = 0;
            }
        }

    } catch (error) {
        console.error("LinkedIn scrape error:", error);
    } finally {
        await browser.close();
    }

    return posts;
}
