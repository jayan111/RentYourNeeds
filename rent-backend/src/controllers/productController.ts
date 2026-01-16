import { Request, Response } from 'express';
import { getDB } from '../config/database';
import { Product } from '../types';
import { invalidateCache } from '../middleware/cache';
import { addJob } from '../services/queue';

const mockProducts = [
  // Electronics - Lower Price Range
  {
    id: '1',
    name: 'Bluetooth Headphones',
    description: 'Wireless noise-cancelling headphones',
    price: 50,
    category: 'electronics',
    stock: 15,
    rating: 4.5,
    reviews: 89,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=400&fit=crop'
    ],
    condition: 'Excellent',
    location: 'Mumbai',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2',
    name: 'Wireless Speaker',
    description: 'Portable Bluetooth speaker with bass',
    price: 75,
    category: 'electronics',
    stock: 12,
    rating: 4.3,
    reviews: 156,
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=400&fit=crop'
    ],
    condition: 'Very Good',
    location: 'Delhi',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '3',
    name: 'Gaming Mouse',
    description: 'RGB gaming mouse with precision sensor',
    price: 35,
    category: 'electronics',
    stock: 20,
    rating: 4.6,
    reviews: 234,
    images: [
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&h=400&fit=crop'
    ],
    condition: 'Excellent',
    location: 'Bangalore',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard for gaming',
    price: 120,
    category: 'electronics',
    stock: 8,
    rating: 4.7,
    reviews: 178,
    images: [
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop'
    ],
    condition: 'Very Good',
    location: 'Chennai',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '5',
    name: 'Webcam HD',
    description: '1080p HD webcam for streaming',
    price: 85,
    category: 'electronics',
    stock: 10,
    rating: 4.4,
    reviews: 92,
    images: [
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop'
    ],
    condition: 'Good',
    location: 'Pune',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Photography - Lower Price Range
  {
    id: '6',
    name: 'Camera Tripod',
    description: 'Adjustable tripod for DSLR cameras',
    price: 45,
    category: 'photography',
    stock: 18,
    rating: 4.2,
    reviews: 67,
    images: [
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=400&fit=crop'
    ],
    condition: 'Excellent',
    location: 'Hyderabad',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '7',
    name: 'Camera Lens 50mm',
    description: 'Prime lens for portrait photography',
    price: 180,
    category: 'photography',
    stock: 5,
    rating: 4.8,
    reviews: 145,
    images: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=400&fit=crop'
    ],
    condition: 'Very Good',
    location: 'Kolkata',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '8',
    name: 'Ring Light',
    description: 'LED ring light for photography and videos',
    price: 65,
    category: 'photography',
    stock: 14,
    rating: 4.5,
    reviews: 203,
    images: [
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop'
    ],
    condition: 'Excellent',
    location: 'Ahmedabad',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '9',
    name: 'Camera Bag',
    description: 'Professional camera bag with padding',
    price: 55,
    category: 'photography',
    stock: 22,
    rating: 4.3,
    reviews: 78,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop'
    ],
    condition: 'Good',
    location: 'Jaipur',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '10',
    name: 'Memory Card 64GB',
    description: 'High-speed SD card for cameras',
    price: 25,
    category: 'photography',
    stock: 30,
    rating: 4.6,
    reviews: 312,
    images: [
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop'
    ],
    condition: 'Excellent',
    location: 'Surat',
    created_at: new Date(),
    updated_at: new Date()
  },
  // Higher Price Items
  {
    id: '11',
    name: 'MacBook Pro 16"',
    description: 'High-performance laptop for professionals',
    price: 3500,
    category: 'electronics',
    stock: 5,
    rating: 4.8,
    reviews: 124,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=400&fit=crop'
    ],
    condition: 'Excellent',
    location: 'Mumbai',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '12',
    name: 'Canon EOS R5',
    description: 'Professional mirrorless camera',
    price: 5200,
    category: 'photography',
    stock: 3,
    rating: 4.9,
    reviews: 89,
    images: [
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=400&fit=crop'
    ],
    condition: 'Excellent',
    location: 'Chennai',
    created_at: new Date(),
    updated_at: new Date()
  }
];

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      limit = 20, 
      offset = 0, 
      search, 
      sortBy = 'relevance',
      rating 
    } = req.query;
    
    let filteredProducts = [...mockProducts];
    
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
      );
    }
    
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseInt(minPrice as string));
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseInt(maxPrice as string));
    }
    
    if (rating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= parseFloat(rating as string));
    }
    
    switch (sortBy) {
      case 'price-low':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        break;
    }
    
    const page = parseInt((req.query.page as string) || '1');
    const limitNum = parseInt(limit as string);
    const startIndex = (page - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    const response = {
      data: paginatedProducts,
      total: filteredProducts.length,
      page: page,
      totalPages: Math.ceil(filteredProducts.length / limitNum),
      hasMore: endIndex < filteredProducts.length,
      limit: limitNum
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = mockProducts.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ data: product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, stock, images } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }
    
    const productId = Date.now().toString();
    
    // Invalidate product cache
    await invalidateCache.products();
    
    // Add analytics job
    await addJob.analytics({
      event: 'product_created',
      userId: req.user?.id || 'admin',
      data: { productId, category, price }
    });
    
    res.status(201).json({
      message: 'Product created successfully',
      data: { id: productId, ...req.body }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Invalidate specific product and products cache
    await invalidateCache.product(id);
    
    // Add inventory update job if stock changed
    if (req.body.stock !== undefined) {
      await addJob.inventory({
        productId: id,
        action: 'stock_update',
        quantity: req.body.stock
      });
    }
    
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Invalidate caches
    await invalidateCache.product(id);
    
    // Add analytics job
    await addJob.analytics({
      event: 'product_deleted',
      userId: req.user?.id || 'admin',
      data: { productId: id }
    });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};