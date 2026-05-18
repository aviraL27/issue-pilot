import { Router } from 'express';
import {
  addWatchlist,
  analyze,
  getHealth,
  getIssues,
  getWatchlist,
  reanalyze
} from '../controllers/repoController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';
import { analysisLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post('/analyze', analysisLimiter, optionalAuth, analyze);
router.post('/reanalyze', analysisLimiter, optionalAuth, reanalyze);
router.get('/issues', optionalAuth, getIssues);
router.get('/health', optionalAuth, getHealth);
router.get('/watchlist', requireAuth, getWatchlist);
router.post('/watchlist', requireAuth, addWatchlist);

export default router;
