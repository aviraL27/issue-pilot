# IssuePilot

IssuePilot helps open-source contributors find GitHub issues that are actually available to work on. Paste a repository URL, scan open issues, and get a verdict for each issue: `Available`, `Likely Taken`, or `Taken`.

## What It Builds

- React + Vite + Tailwind frontend in `client`
- Node + Express backend in `server`
- MongoDB Atlas persistence with Mongoose
- Firebase Authentication with Google OAuth and GitHub OAuth
- GitHub REST API v3 access through the backend only
- Gemini-first AI helpers with Hugging Face fallback for free-tier classification

## Key Behaviors

- Fetches all open GitHub issues with pagination.
- Caches processed repo results for 30 minutes in MongoDB.
- Supports a `Re-analyze` action that bypasses cache unless the previous scan is less than 2 minutes old.
- Detects issue availability with assignees, linked PR timeline events, recent claim comments, and AI prediction.
- Stores GitHub tokens encrypted on the user record. Tokens are never returned to the frontend after saving.
- Allows unauthenticated public repo analysis, subject to GitHub's unauthenticated rate limit.

## Setup

Install dependencies in both apps:

```bash
cd server
npm install

cd ../client
npm install
```

Create env files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

## Server Environment

`server/.env`

```bash
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/issuepilot
JWT_SECRET=replace-with-a-long-random-secret
GITHUB_TOKEN=
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@example.iam.gserviceaccount.com
GEMINI_API_KEY=
HUGGINGFACE_API_KEY=
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
GEMINI_MODEL=gemini-1.5-flash
```

`GITHUB_TOKEN` is optional and acts as a fallback server token. Authenticated users can save their own GitHub token from the dashboard.

## Client Environment

`client/.env`

```bash
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-client-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication.
3. Enable Google as a sign-in provider.
4. Enable GitHub as a sign-in provider and configure the OAuth app client ID and secret.
5. Add `http://localhost:5173` as an authorized domain for local development if needed.
6. Create a Firebase Admin service account key.
7. Copy `project_id`, `client_email`, and `private_key` into `server/.env`.
8. Copy the web app config into `client/.env`.

Important: Firebase Admin cannot recover the GitHub OAuth access token from a Firebase ID token. The client captures the GitHub credential during `signInWithPopup` and sends the provider access token to `/api/auth/firebase-login`, where the server verifies and encrypts it.

## Run Locally

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Open:

```text
http://localhost:5173
```

## API Routes

Auth:

- `POST /api/auth/firebase-login`
- `GET /api/auth/me`
- `POST /api/auth/save-token`
- `POST /api/auth/logout`

Repo:

- `POST /api/repo/analyze`
- `POST /api/repo/reanalyze`
- `GET /api/repo/issues`
- `GET /api/repo/health`
- `GET /api/repo/watchlist`
- `POST /api/repo/watchlist`

Issues:

- `GET /api/issues/:owner/:repo/:issueNumber`
- `POST /api/issues/bookmark`
- `GET /api/issues/bookmarks`

## AI Strategy

Gemini is used when `GEMINI_API_KEY` is present. Hugging Face is used as a fallback for zero-shot classification when `HUGGINGFACE_API_KEY` is present. If AI calls fail or no key is configured, IssuePilot falls back to label and keyword-based logic.

## Notes

- GitHub issue timeline calls may require an authenticated token on some repositories or under tighter rate limits.
- Repo health is computed from recent commits, issue closure ratio, closed issue response time, and recent PR merge rate.
- The frontend includes Tailwind dark-mode configuration, with dark surfaces already used for the login terminal and token panel.
