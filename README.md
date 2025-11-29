# EigoKit Student App

Mobile-friendly web application for students to practice English through games, surveys, and progress tracking.

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Fill in your environment variables in `.env`:
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_PROJECT_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_key_here  # "Publishable key" in Project Settings > API keys
```

## Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in the terminal).

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to be deployed to services like Vercel, Render, Netlify, etc.

## Features

- **Student Registration**: Icon-based authentication (no passwords)
- **Student Sign-In**: Simple icon sequence authentication
- **Dashboard**: View progress, streaks, points, and leaderboard position
- **Games**: Three practice games:
  - Word Match Rush
  - Sentence Builder Blocks
  - Pronunciation Adventure
- **Surveys**: Post-lesson surveys with emoji scales, multiple choice, yes/no, and short answer questions
- **Theming**: Supports school-specific branding and styling

## Deployment

This app can be deployed to:
- Vercel
- Netlify
- Render
- Cloudflare Pages
- Any static hosting service

Make sure to set the environment variables in your deployment platform.
