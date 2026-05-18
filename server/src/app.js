import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import repoRoutes from './routes/repoRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: '> Error: too many requests, slow down and try again.' }
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'IssuePilot' });
});

app.use('/api/auth', authRoutes);
app.use('/api/repo', repoRoutes);
app.use('/api/issues', issueRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
