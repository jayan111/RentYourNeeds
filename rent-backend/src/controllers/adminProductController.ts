import { Response } from 'express';
import { getDB } from '../config/database';
import { AuthenticatedRequest } from '../types';
import { invalidateCache } from '../middleware/cache';
import { addJob } from '../services/queue';
import { RowDataPacket } from 'mysql2';
import { parseImages, parseSubscriptionDurations, normalizeImageUrls } from '../utils/productJson';

interface ProductRow extends RowDataPacket {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  stock: number;
  rating: number;
  reviews: number;
  images: string;
  condition_type: string;
  location: string;
  availability: string;
  subscription_durations: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  category_name?: string;
}

export const getAdminProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      category, 
      minPrice, 
      search, 
      sortBy = 'relevance',
      rating,
      page = 1,
      limit = 50,
      status = 'all'
    } = req.query;
    
    const db = await getDB();
    if (!db) {
      return res.status(500).json({ message: 'Database connection failed' });
    }

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params: any[] = [];
    
    // Admin can see all products including inactive ones
    if (status !== 'all') {
      if (status === 'active') {
        query += ` AND p.is_active = TRUE`;
      } else if (status === 'inactive') {
        query += ` AND p.is_active = FALSE`;
      } else {
        query += ` AND p.availability = ?`;
        params.push(status);
      }
    }
    
    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (category && category !== 'all') {
      query += ` AND p.category_id = ?`;
      params.push(category);
    }
    
    if (minPrice) {
      query += ` AND p.price >= ?`;
      params.push(parseInt(minPrice as string));
    }
    
    if (rating) {
      query += ` AND p.rating >= ?`;
      params.push(parseFloat(rating as string));
    }
    
    // Sorting
    switch (sortBy) {
      case 'price-low':
        query += ` ORDER BY p.price ASC`;
        break;
      case 'price-high':
        query += ` ORDER BY p.price DESC`;
        break;
      case 'rating':
        query += ` ORDER BY p.rating DESC`;
        break;
      case 'newest':
        query += ` ORDER BY p.created_at DESC`;
        break;
      default:
        query += ` ORDER BY p.created_at DESC`;
        break;
    }
    
    // Count total products for pagination
    const countQuery = query.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*) as total').split('ORDER BY')[0];
    const [countResult] = await db.query<any[]>(countQuery, params);
    const total = countResult[0]?.total || 0;
    
    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    query += ` LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);
    
    const [products] = await db.query<ProductRow[]>(query, params);
    
    const formattedProducts = products.map(product => {
      // Safely parse JSON fields
      let parsedImages = [];
      let parsedSubscriptionDurations = [3, 6, 12];
      
      try {
        parsedImages = product.images ? JSON.parse(product.images).map((img: string) => 
          img.startsWith('http') ? img : `http://localhost:8000${img}`
        ) : [];
      } catch (e) {
        console.error('Error parsing images for product', product.id, ':', e);
        parsedImages = [];
      }
      
      try {
        parsedSubscriptionDurations = product.subscription_durations ? JSON.parse(product.subscription_durations) : [3, 6, 12];
      } catch (e) {
        console.error('Error parsing subscription_durations for product', product.id, ':', e);
        parsedSubscriptionDurations = [3, 6, 12];
      }
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category_id,
        categoryName: product.category_name,
        stock: product.stock,
        rating: product.rating,
        reviews: product.reviews,
        images: parsedImages,
        condition: product.condition_type,
        location: product.location,
        availability: product.availability,
        subscriptionDurations: parsedSubscriptionDurations,
        is_active: product.is_active,
        created_at: product.created_at,
        updated_at: product.updated_at
      };
    });
    
    const totalPages = Math.ceil(total / limitNum);
    const hasMore = pageNum < totalPages;
    
    const response = {
      data: formattedProducts,
      total,
      page: pageNum,
      totalPages,
      hasMore,
      limit: limitNum
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAdminProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category,
      stock, 
      condition = 'Good',
      location
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const multerFiles = (req.files as Express.Multer.File[]) || [];
    let images: string[] = [];

    if (multerFiles.length) {
      images = multerFiles.map(f => `uploads/${f.filename}`);
    } else if (req.body.images !== undefined && req.body.images !== null) {
      const raw = req.body.images;
      if (Array.isArray(raw)) {
        images = raw.map(String);
      } else if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (trimmed.startsWith("[")) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) images = parsed.map(String);
            else images = [String(parsed)];
          } catch (err) {
            images = trimmed.split(",").map(s => s.trim()).filter(Boolean);
          }
        } else if (trimmed.includes(",")) {
          images = trimmed.split(",").map(s => s.trim()).filter(Boolean);
        } else {
          images = [trimmed];
        }
      } else {
        images = [String(raw)];
      }
    }

    images = images.map(img => img.replace(/^\/+/, "").replace(/\\/g, "/"));

    let subscriptionDurations: number[] = [];
    const rawDur = req.body.subscription_durations ?? req.body.subscriptionDurations;
    if (rawDur !== undefined && rawDur !== null) {
      if (Array.isArray(rawDur)) {
        subscriptionDurations = rawDur.map((x: any) => Number(x)).filter(n => !Number.isNaN(n));
      } else if (typeof rawDur === "string") {
        const s = rawDur.trim();
        if (s.startsWith("[")) {
          try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) subscriptionDurations = parsed.map((x: any) => Number(x)).filter(n => !Number.isNaN(n));
          } catch (err) {
            subscriptionDurations = s.split(",").map(x => Number(x.trim())).filter(n => !Number.isNaN(n));
          }
        } else if (s.includes(",")) {
          subscriptionDurations = s.split(",").map(x => Number(x.trim())).filter(n => !Number.isNaN(n));
        } else {
          const n = Number(s);
          if (!Number.isNaN(n)) subscriptionDurations = [n];
        }
      } else {
        const n = Number(rawDur);
        if (!Number.isNaN(n)) subscriptionDurations = [n];
      }
    }

    const db = await getDB();
    if (!db) {
      return res.status(500).json({ message: 'Database connection failed' });
    }

    const productId = `product_${Date.now()}`;

    await db.query(
      `INSERT INTO products (id, name, description, price, category_id, stock, images, condition_type, location, subscription_durations) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId, 
        name, 
        description, 
        parseFloat(price), 
        category,
        parseInt(stock) || 0, 
        JSON.stringify(images), 
        condition,
        location,
        JSON.stringify(subscriptionDurations)
      ]
    );

    const [products] = await db.query<ProductRow[]>(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [productId]
    );

    if (!products || products.length === 0) {
      return res.status(500).json({ message: 'Failed to retrieve created product' });
    }

    const product = products[0];

    let parsedImages = [];
    let parsedSubscriptionDurations = [3, 6, 12];

    try {
      parsedImages = product.images ? JSON.parse(product.images).map((img: string) => 
        img.startsWith('http') ? img : `http://localhost:8000${img}`
      ) : [];
    } catch (e) {
      console.error('Error parsing images:', e);
      parsedImages = [];
    }

    try {
      parsedSubscriptionDurations = product.subscription_durations ? JSON.parse(product.subscription_durations) : [3, 6, 12];
    } catch (e) {
      console.error('Error parsing subscription_durations:', e);
      parsedSubscriptionDurations = [3, 6, 12];
    }

    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category_id,
      categoryName: product.category_name,
      stock: product.stock,
      rating: product.rating,
      reviews: product.reviews,
      images: parsedImages,
      condition: product.condition_type,
      location: product.location,
      availability: product.availability,
      subscriptionDurations: parsedSubscriptionDurations,
      is_active: product.is_active,
      created_at: product.created_at,
      updated_at: product.updated_at
    };

    try {
      await invalidateCache.products();
    } catch (cacheError) {
      console.log('Cache invalidation failed:', cacheError);
    }

    try {
      await addJob.analytics({
        event: 'product_created',
        userId: req.user?.id || 'admin',
        data: { productId, category, price: parseFloat(price) }
      });
    } catch (queueError) {
      console.log('Analytics job failed:', queueError);
    }

    res.status(201).json({
      message: 'Product created successfully',
      data: formattedProduct
    });
  } catch (error: any) {
    console.error('Create admin product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateAdminProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const db = await getDB();
    if (!db) {
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    const updateFields: string[] = [];
    const values: any[] = [];
    
    Object.keys(updates).forEach(key => {
      if (['images', 'subscription_durations'].includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(JSON.stringify(updates[key]));
      } else if (key === 'category') {
        updateFields.push(`category_id = ?`);
        values.push(updates[key]);
      } else if (key === 'condition') {
        updateFields.push(`condition_type = ?`);
        values.push(updates[key]);
      } else if (key !== 'id') {
        updateFields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    values.push(id);
    
    await db.query(
      `UPDATE products SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    await invalidateCache.product(id);
    
    if (updates.stock !== undefined) {
      await addJob.inventory({
        productId: id,
        action: 'stock_update',
        quantity: updates.stock
      });
    }
    
    res.json({ message: 'Product updated successfully' });
  } catch (error: any) {
    console.error('Update admin product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteAdminProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const db = await getDB();
    if (!db) {
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    await db.query('UPDATE products SET is_active = FALSE WHERE id = ?', [id]);
    
    await invalidateCache.product(id);
    
    await addJob.analytics({
      event: 'product_deleted',
      userId: req.user?.id || 'admin',
      data: { productId: id }
    });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete admin product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const uploadAdminImage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Upload admin image error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};