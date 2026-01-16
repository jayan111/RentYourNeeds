import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { cacheProducts, cacheProduct } from '../middleware/cache';
import { rateLimits } from '../middleware/rateLimiting';

const router = Router();

// Apply rate limiting
router.use(rateLimits.products);

router.get('/', cacheProducts, getProducts);
router.get('/:id', cacheProduct, getProductById);
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

export default router;