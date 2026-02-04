
import dotenv from 'dotenv';
import { sendEmailViaGmail } from '../lib/email/service';
import { google } from 'googleapis';

dotenv.config({ path: '.env.local' });

async function testEmail() {
    console.log('Testing email service...');

    // Check env vars
    console.log('CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
    console.log('CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing');

    // MOCK: We need a valid access token to test this script. 
    // Since we can't easily get one without a UI flow, this script is limited 
    // to validating the configuration load and function accessibility.

    // To fully test, you would need to paste a valid token here manually:
    const MOCK_TOKEN = process.env.TEST_ACCESS_TOKEN;

    if (!MOCK_TOKEN) {
        console.warn('No TEST_ACCESS_TOKEN provided in env. Skipping actual send call.');
        console.log('Setup verified. To test sending, add TEST_ACCESS_TOKEN to .env.local');
        return;
    }

    const result = await sendEmailViaGmail(MOCK_TOKEN, undefined, 'test@example.com', {
        to: 'recipient@example.com',
        subject: 'Test Email from Script',
        htmlBody: '<p>This is a test email.</p>',
        textBody: 'This is a test email.'
    });

    console.log('Send Result:', result);
}

testEmail().catch(console.error);
