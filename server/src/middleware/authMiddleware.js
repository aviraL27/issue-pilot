import jwt from 'jsonwebtoken';
import User from '../models/User.js';

async function hydrateUser(req, token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.sub);
  if (!req.user) {
    const error = new Error('Authentication user not found');
    error.statusCode = 401;
    throw error;
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const token = req.cookies?.issuepilot_token || bearer;
    if (token) await hydrateUser(req, token);
    next();
  } catch {
    next();
  }
}

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const token = req.cookies?.issuepilot_token || bearer;
    if (!token) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }
    await hydrateUser(req, token);
    next();
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
}
