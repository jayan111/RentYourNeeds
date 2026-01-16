import express from 'express';
import {
  // Dashboard
  getDashboardStats,
  getRevenueAnalytics,
  getInventoryAnalytics,
  getCustomerAnalytics,
  getOperationalMetrics,
  // Products
  getAllProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  updateProductStatus,
  // Inventory
  getInventoryAdmin,
  updateInventoryItem,
  bulkUpdateInventory
} from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { cacheDashboard } from '../middleware/cache';
import { rateLimits } from '../middleware/rateLimiting';

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
router.get('/products', getAllProductsAdmin);
router.post('/products', createProductAdmin);
router.put('/products/:id', updateProductAdmin);
router.delete('/products/:id', deleteProductAdmin);
router.patch('/products/:id/status', updateProductStatus);

// Inventory management routes
router.get('/inventory', getInventoryAdmin);
router.put('/inventory/:id', updateInventoryItem);
router.patch('/inventory/bulk', bulkUpdateInventory);

export default router;