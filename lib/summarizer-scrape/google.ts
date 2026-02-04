import { google } from 'googleapis';

export const getGoogleAuth = (accessToken: string, refreshToken?: string) => {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });
    return auth;
};

export const getGmailClient = (accessToken: string, refreshToken?: string) => {
    const auth = getGoogleAuth(accessToken, refreshToken);
    return google.gmail({ version: 'v1', auth });
};

export const getCalendarClient = (accessToken: string, refreshToken?: string) => {
    const auth = getGoogleAuth(accessToken, refreshToken);
    return google.calendar({ version: 'v3', auth });
};
