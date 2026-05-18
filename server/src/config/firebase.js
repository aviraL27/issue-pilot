import admin from 'firebase-admin';

export function getFirebaseAdmin() {
  if (admin.apps.length) return admin;

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!process.env.FIREBASE_PROJECT_ID || !privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('Firebase Admin environment variables are required');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    })
  });

  return admin;
}
