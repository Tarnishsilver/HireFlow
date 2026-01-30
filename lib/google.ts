import { google } from 'googleapis';

export const getGoogleAuth = (accessToken: string) => {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ access_token: accessToken });
    return auth;
};

export const getGmailClient = (accessToken: string) => {
    const auth = getGoogleAuth(accessToken);
    return google.gmail({ version: 'v1', auth });
};

export const getCalendarClient = (accessToken: string) => {
    const auth = getGoogleAuth(accessToken);
    return google.calendar({ version: 'v3', auth });
};
