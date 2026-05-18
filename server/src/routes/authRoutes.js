import { Router } from 'express';
import { firebaseLogin, logout, me, saveToken } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/firebase-login', firebaseLogin);
router.get('/me', requireAuth, me);
router.post('/save-token', requireAuth, saveToken);
router.post('/logout', logout);

export default router;
