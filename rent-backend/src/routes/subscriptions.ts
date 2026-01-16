import express from 'express';
import {
  createSubscription,
  getUserSubscriptions,
  pauseSubscription,
  cancelSubscription,
  getPaymentHistory,
  processPayment
} from '../controllers/subscriptionController';

const router = express.Router();

// Subscription routes
router.post('/', createSubscription);
router.get('/user', getUserSubscriptions);
router.patch('/:id/pause', pauseSubscription);
router.patch('/:id/cancel', cancelSubscription);

// Payment routes
router.get('/:subscriptionId/payments', getPaymentHistory);
router.post('/payments', processPayment);

export default router;