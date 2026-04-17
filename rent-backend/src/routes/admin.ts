import express, { Response } from 'express';
import {
  // Dashboard
  getDashboardStats,
  getRevenueAnalytics,
  getInventoryAnalytics,
  getCustomerAnalytics,
  getOperationalMetrics,
  // Inventory
  getInventoryAdmin,
  updateInventoryItem,
  bulkUpdateInventory
} from '../controllers/adminController';
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadAdminImage
} from '../controllers/adminProductController';
import { getAllSubscriptionsAdmin, updateSubscriptionAdmin } from '../controllers/subscriptionController';
import { getAllUsers } from '../controllers/userController';
import { getAdminOrders } from '../controllers/orderController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { cacheDashboard } from '../middleware/cache';
import { rateLimits } from '../middleware/rateLimiting';
import { uploadProductImages, uploadSingleImage } from '../middleware/upload';
import { getDB } from '../config/database';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Apply admin rate limiting and authentication
router.use(rateLimits.admin);
router.use(authenticateToken, requireAdmin);

// Dashboard routes
router.get('/stats', cacheDashboard, getDashboardStats);
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/inventory', getInventoryAnalytics);
router.get('/analytics/customers', getCustomerAnalytics);
router.get('/metrics/operations', getOperationalMetrics);

// Product management routes
router.get('/products', getAdminProducts);
router.post('/products', uploadProductImages, createAdminProduct);
router.put('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);
router.post('/upload-image', uploadSingleImage, uploadAdminImage);

// Inventory management routes
router.get('/inventory', getInventoryAdmin);
router.put('/inventory/:id', updateInventoryItem);
router.patch('/inventory/bulk', bulkUpdateInventory);

// Orders routes (admin flat format)
router.get('/orders', getAdminOrders);

// User management routes
router.get('/users', getAllUsers);
router.patch('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active, role } = req.body;

    const db = await getDB();
    if (!db) return res.status(500).json({ message: 'Database connection failed' });

    const updates: string[] = [];
    const values: any[] = [];

    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
    if (role) { updates.push('role = ?'); values.push(role); }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    await db.query(`UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);

    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({ message: 'User updated successfully', data: (rows as any[])[0] });
  } catch (error) {
    console.error('Update user admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Subscription management routes
router.get('/subscriptions', getAllSubscriptionsAdmin);
router.patch('/subscriptions/:id', updateSubscriptionAdmin);

export default router;
