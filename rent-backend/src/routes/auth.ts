import express from 'express';
import { login, register, forgotPassword, resetPassword, verifyToken } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify', authenticateToken, verifyToken);

export default router;