# HR Pulse Enterprise Dashboard

A modern HR dashboard that integrates with Google Workspace (Gmail & Calendar) to rationalize recruitment and onboarding workflows.

## 🚀 Features

- **Google Authentication**: Secure sign-in using Firebase Authentication with Google Provider.
- **Gmail Scraping**: Automatically fetches and categorizes HR-related emails (Interviews, Offers, Onboarding).
- **Calendar Integration**: Displays upcoming HR events.
- **Email-to-Calendar Automation**: Heuristically parses emails to creating calendar events for interviews and meetings.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Firebase Auth (Google Sign-In)
- **Backend API**: Server Actions (`app/actions.ts`)
- **Google APIs**: Gmail API, Calendar API (`googleapis` library)
- **Styling**: Tailwind CSS

## 🔐 Setup & Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Google Cloud Platform (GCP)
Ensure the following APIs are enabled in your GCP Project associated with Firebase:
- **Gmail API**
- **Google Calendar API**

### 3. Firebase Authentication
- Go to Firebase Console > Authentication > Sign-in method.
- Enable **Google**.
- Add necessary scopes to your client-side provider configuration (already handled in `app/firebase.ts`):
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/calendar.readonly`

## 🧠 How It Works

### Authentication Flow
1. User clicks **"Sign In with Google"**.
2. Firebase popup requests consent for Gmail and Calendar access.
3. On success, the **Google Access Token** is retrieved from the credential result.
4. This token is passed to Server Actions to authenticate calls to the Google API on behalf of the user.

### Email Scraping (`lib/gmail.ts`)
- **Function**: `fetchHREmails(accessToken)`
- **Logic**:
  - Queries Gmail for messages from the **last 7 days**.
  - Filters by keywords: `interview OR offer OR onboarding OR HR OR meeting OR schedule`.
  - Parses headers to extract Subject, Sender, and Date.
  - Summaries and Categories are currently generated with deterministic logic (mock AI) but designed to be replaced by an LLM.

### Email-to-Calendar Automation (`app/actions.ts`)
- **Function**: `syncEmailsToCalendar(accessToken)`
- **Logic**:
  1. Fetches recent HR emails.
  2. Identifies emails with "Interview" or "Meeting" in the subject.
  3. **Heuristic Parsing**: Currently defaults these events to specific slots (e.g., "Tomorrow at 10am") for demonstration.
  4. Calls `createCalendarEvent` to insert them into the user's primary calendar.

## 📦 Running Locally

```bash
npm run dev
# Open http://localhost:3000
```
