# IssuePilot

IssuePilot helps open-source contributors find GitHub issues that are actually worth picking up. Paste a public repository, scan its open issues, and get a practical availability verdict before spending time on a task that is already assigned, claimed, blocked, or linked to an active PR.

**GitHub description:** Find open-source GitHub issues that are actually available, with repo analysis, issue verdicts, bookmarks, and contributor workflow tools.

## Features

- Analyze any public GitHub repository by URL or `owner/repo`.
- Classify open issues as `AVAILABLE`, `LIKELY_TAKEN`, `TAKEN`, or `UNCERTAIN`.
- Detect availability using assignees, labels, linked pull requests, timeline events, comments, and AI-assisted signals.
- Cache repository scans in MongoDB to reduce repeated GitHub API calls.
- Re-analyze repositories when fresh data is needed.
- View repo health signals such as recent activity, closure rate, and PR merge activity.
- Sign in with Firebase Authentication.
- Save watchlisted repositories and bookmarked issues.
- Save a GitHub token for higher API limits. Tokens are encrypted before storage and never returned in API responses.
- Frontend security headers configured for Vercel with CSP, frame protection, content sniffing protection, and referrer policy.
- Backend security middleware with Helmet, CORS, generic production errors, and rate limiting.

## Tech Stack

**Frontend**

- React
- Vite
- Tailwind CSS
- React Router
- Firebase client auth
- Axios

**Backend**

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Firebase Admin
- GitHub REST API
- Gemini AI with Hugging Face fallback
- Helmet
- Express rate limiting

## Project Structure

```text
issue-tracker/
  client/                 # React + Vite frontend
    src/
    vercel.json           # Vercel security headers
  server/                 # Express API
    src/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
```

## User Workflow

1. User opens the frontend hosted on Vercel.
2. User pastes a GitHub repository URL, for example `facebook/react`.
3. Frontend sends the repo request to the Render-hosted backend.
4. Backend fetches issues, comments, timelines, commits, and pull request signals from GitHub.
5. Backend processes each issue and stores a cached scan result in MongoDB.
6. Frontend shows verdicts, labels, repo health, filters, and issue details.
7. Signed-in users can save a GitHub token, add repos to a watchlist, and bookmark issues.

## Analysis Workflow

IssuePilot scores issue availability with a layered approach:

```text
GitHub repo input
  -> parse owner/repo
  -> check MongoDB cache
  -> fetch open issues from GitHub
  -> inspect assignees, labels, comments, timeline events, linked PRs
  -> apply AI/heuristic verdict logic
  -> store result in MongoDB
  -> return issue verdicts and repo health to the frontend
```

The app can work without a user GitHub token, but authenticated GitHub access gives better rate limits and more reliable timeline data.

## Security Model

- `.env` files are ignored by git.
- GitHub tokens are encrypted with AES-256-GCM before being saved to MongoDB.
- API responses expose `hasGithubToken`, not the raw token.
- Protected user routes use auth middleware.
- `/api/repo/analyze` and `/api/repo/reanalyze` have stricter rate limits.
- Backend CORS is restricted through `CLIENT_ORIGIN`.
- Backend uses Helmet with backend CSP disabled because the frontend owns its CSP through `client/vercel.json`.
- Frontend Vercel headers include CSP, `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`.
- Production error responses are generic.
- Production request logging is reduced.

## Environment Variables

Create local env files:

```bash
server/.env
client/.env
```

### Server

```bash
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/issuepilot
JWT_SECRET=replace-with-a-long-random-secret
GITHUB_TOKEN=
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@example.iam.gserviceaccount.com
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
HUGGINGFACE_API_KEY=
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

`GITHUB_TOKEN` is optional. It acts as a fallback server token when a user has not saved their own token.

### Client

```bash
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-client-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

For production, set `VITE_API_URL` to your Render API base URL, for example:

```bash
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

Also update `client/vercel.json` so the CSP `connect-src` includes the actual Render origin:

```text
https://your-render-backend-url.onrender.com
```

## Local Development

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Run the backend:

```bash
cd server
npm run dev
```

Run the frontend:

```bash
cd client
npm run dev
```

Open:

```text
http://localhost:5173
```

## Deployment

### Backend on Render

Use the `server` folder as the backend service root.

```bash
npm install
npm start
```

Set production environment variables in Render:

```bash
NODE_ENV=production
MONGODB_URI=...
JWT_SECRET=...
CLIENT_ORIGIN=https://issuepilot.me
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
GITHUB_TOKEN=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
HUGGINGFACE_API_KEY=
```

The backend health route is:

```text
GET /health
```

### Frontend on Vercel

Use the `client` folder as the Vercel project root.

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Set frontend environment variables in Vercel:

```bash
VITE_API_URL=https://your-render-backend-url.onrender.com/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

## API Routes

### Health

```text
GET /health
GET /api/health
```

### Auth

```text
POST /api/auth/firebase-login
GET  /api/auth/me
POST /api/auth/save-token
POST /api/auth/logout
```

### Repositories

```text
POST /api/repo/analyze
POST /api/repo/reanalyze
GET  /api/repo/issues
GET  /api/repo/health
GET  /api/repo/watchlist
POST /api/repo/watchlist
```

### Issues

```text
GET  /api/issues/:owner/:repo/:issueNumber
GET  /api/issues/bookmarks
POST /api/issues/bookmark
```

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication.
3. Enable Google sign-in.
4. Enable GitHub sign-in and configure the OAuth app client ID and secret.
5. Add local and production domains to Firebase authorized domains.
6. Create a Firebase Admin service account.
7. Copy the Admin `project_id`, `client_email`, and `private_key` into `server/.env`.
8. Copy the Firebase web app config into `client/.env`.

The client captures the GitHub OAuth provider access token during sign-in and sends it to the backend. The backend verifies it with GitHub, encrypts it, and stores it on the user record.

## Security Testing

Suggested checks before going live:

- Mozilla Observatory scan for frontend headers.
- OWASP ZAP passive scan against the frontend and backend API.
- Confirm `githubToken` is never returned in API responses.
- Confirm protected routes reject unauthenticated requests.
- Confirm CORS only allows the production frontend origin.
- Confirm Render has `NODE_ENV=production`.
- Confirm MongoDB Atlas network access is locked down as tightly as your hosting setup allows.

## Notes

- GitHub API rate limits are much better when a user saves a token.
- AI helpers are optional; the app falls back to rule-based analysis when AI keys are missing.
- Cached repo analysis helps reduce GitHub API usage and improves repeat load speed.
