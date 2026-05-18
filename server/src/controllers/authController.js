import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getFirebaseAdmin } from '../config/firebase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { encryptToken } from '../utils/tokenCrypto.js';
import { verifyToken } from '../services/githubService.js';

function signUser(user) {
  return jwt.sign({ sub: user._id.toString(), firebaseUid: user.firebaseUid }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}

function publicUser(user) {
  return {
    id: user._id,
    firebaseUid: user.firebaseUid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    githubUsername: user.githubUsername,
    hasGithubToken: Boolean(user.githubToken),
    watchlist: user.watchlist,
    bookmarks: user.bookmarks
  };
}

export const firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken, githubAccessToken } = req.body;
  if (!idToken) {
    const error = new Error('Firebase ID token is required');
    error.statusCode = 400;
    throw error;
  }

  const decoded = await getFirebaseAdmin().auth().verifyIdToken(idToken);
  const update = {
    firebaseUid: decoded.uid,
    email: decoded.email,
    displayName: decoded.name,
    photoURL: decoded.picture
  };

  if (githubAccessToken) {
    const verified = await verifyToken(githubAccessToken);
    update.githubToken = encryptToken(githubAccessToken);
    update.githubUsername = verified.username;
  }

  const user = await User.findOneAndUpdate({ firebaseUid: decoded.uid }, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  });

  const token = signUser(user);
  res.cookie('issuepilot_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.json({ token, user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export const saveToken = asyncHandler(async (req, res) => {
  const { githubToken } = req.body;
  if (!githubToken) {
    const error = new Error('GitHub token is required');
    error.statusCode = 400;
    throw error;
  }

  const verified = await verifyToken(githubToken);
  req.user.githubToken = encryptToken(githubToken);
  req.user.githubUsername = verified.username;
  await req.user.save();
  res.json({ status: 'valid', githubUsername: verified.username, rateLimit: verified });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('issuepilot_token');
  res.json({ ok: true });
});
