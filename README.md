# HR Pulse Enterprise Dashboard

A modern HR dashboard that integrates with Google Workspace (Gmail) to streamline email management with AI-powered summaries.

## 🚀 Features

- **Google Authentication**: Secure sign-in using Firebase Authentication with Google Provider.
- **Email Scraping**: Automatically fetches emails from your inbox.
- **AI Summaries**: Uses Groq (LLaMA 3.1) to generate concise email summaries.
- **Calendar Integration**: Displays upcoming events.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Firebase Auth (Google Sign-In)
- **AI**: Groq SDK (LLaMA 3.1)
- **Google APIs**: Gmail API, Calendar API
- **Styling**: Tailwind CSS

## 🔐 Setup & Configuration

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd <your-project-folder>
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

**Required variables:**
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase configuration (from Firebase Console) |
| `GROQ_API_KEY` | Your Groq API key (from [console.groq.com](https://console.groq.com)) |

### 3. Google Cloud Platform (GCP)

Ensure these APIs are enabled in your GCP Project:
- **Gmail API**
- **Google Calendar API**

### 4. Firebase Authentication

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable **Google**
3. Make sure your domain is added to authorized domains

## 📦 Running Locally

```bash
npm run dev
# Open http://localhost:3000
```

## 🚀 Deployment (Vercel)

1. Push your code to GitHub
2. Connect the repo to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's dashboard
4. Update your Firebase authorized domains to include your Vercel URL
5. Deploy!

**Important**: For production, ensure your Google Cloud OAuth authorized redirect URIs include your Vercel domain.

## 📁 Project Structure

```
├── app/                # Next.js App Router
│   ├── actions.ts      # Server Actions
│   └── page.tsx        # Main dashboard page
├── components/         # React components
├── lib/                # Utilities
│   ├── gmail.ts        # Gmail API integration
│   ├── groq.ts         # Groq AI summarization
│   └── google.ts       # Google API client
└── public/             # Static assets
```

## 📄 License

MIT
