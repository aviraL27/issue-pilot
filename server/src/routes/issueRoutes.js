import { Router } from 'express';
import { bookmarkIssue, getBookmarks, getIssueDetail } from '../controllers/issueController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/bookmarks', requireAuth, getBookmarks);
router.post('/bookmark', requireAuth, bookmarkIssue);
router.get('/:owner/:repo/:issueNumber', optionalAuth, getIssueDetail);

export default router;
