import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const firebaseReady = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

const app = firebaseReady ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
export const googleProvider = new GoogleAuthProvider();
export const isFirebaseConfigured = firebaseReady;
