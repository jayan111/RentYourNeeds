import { Response } from 'express';
import { AuthenticatedRequest, Product } from '../types';

// Mock data for products with extended status
const mockProducts: (Product & { price?: number })[] = [
  {
    id: '1',
    name: 'MacBook Pro 16"',
    description: 'High-performance laptop for professionals',
    category: 'Electronics',
    brand: 'Apple',
    model: 'MacBook Pro 16"',
    specifications: { ram: '16GB', storage: '512GB SSD', processor: 'M2 Pro' },
    images: ['/images/macbook.jpg'],
    monthlyRent: 2500,
    price: 2500,
    securityDeposit: 25000,
    minRentalPeriod: 1,
    maxRentalPeriod: 24,
    condition: 'new',
    status: 'available',
    totalStock: 25,
    availableStock: 25,
    location: 'Mumbai Warehouse',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with advanced features',
    category: 'Electronics',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    specifications: { storage: '256GB', camera: '48MP Pro', display: '6.1"' },
    images: ['/images/iphone.jpg'],
    monthlyRent: 1200,
    price: 1200,
    securityDeposit: 12000,
    minRentalPeriod: 1,
    maxRentalPeriod: 12,
    condition: 'new',
    status: 'available',
    totalStock: 0,
    availableStock: 0,
    location: 'Delhi Warehouse',
    created_at: new Date('2024-01-02'),
    updated_at: new Date('2024-01-02')
  }
];

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = {
      revenue: {
        monthly: 2500000,
        quarterly: 7200000,
        yearly: 28800000,
        growth: 15.5
      },
      subscriptions: {
        active: 1250,
        paused: 45,
        cancelled: 23,
        total: 1318
      },
      inventory: {
        total: 5000,
        available: 3200,
        rented: 1250,
        maintenance: 350,
        retired: 200
      },
      users: {
        total: 2500,
        verified: 2100,
        pending: 300,
        rejected: 100
      }
    };

    res.json({ data: stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRevenueAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const monthlyData = [
      { month: 'Jan', revenue: 2200000, subscriptions: 1100 },
      { month: 'Feb', revenue: 2350000, subscriptions: 1150 },
      { month: 'Mar', revenue: 2500000, subscriptions: 1250 }
    ];

    res.json({ data: { analytics: monthlyData } });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInventoryAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const analytics = {
      utilizationRate: 78.5,
      topPerformingProducts: [
        { productId: '1', name: 'MacBook Pro', rentals: 450, revenue: 1125000 }
      ]
    };

    res.json({ data: analytics });
  } catch (error) {
    console.error('Get inventory analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCustomerAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const analytics = {
      customerLifetimeValue: 45000,
      churnRate: 5.2
    };

    res.json({ data: analytics });
  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOperationalMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const metrics = {
      deliveryMetrics: {
        averageDeliveryTime: 2.5,
        onTimeDeliveryRate: 92.5
      }
    };

    res.json({ data: metrics });
  } catch (error) {
    console.error('Get operational metrics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllProductsAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    let products = [...mockProducts];

    if (status && status !== 'all') {
      products = products.filter(p => p.status === status);
    }

    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }

    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.json({
      data: paginatedProducts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: products.length,
        pages: Math.ceil(products.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get products admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProductAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, category, brand, model, monthlyRent, securityDeposit, totalStock } = req.body;

    const newProduct: Product & { price?: number } = {
      id: `prod_${Date.now()}`,
      name,
      description,
      category,
      brand: brand || 'Generic',
      model: model || name,
      specifications: {},
      images: [],
      monthlyRent: Number(monthlyRent),
      price: Number(monthlyRent),
      securityDeposit: Number(securityDeposit),
      minRentalPeriod: 1,
      maxRentalPeriod: 24,
      condition: 'new',
      status: totalStock > 0 ? 'available' : 'retired',
      totalStock: Number(totalStock),
      availableStock: Number(totalStock),
      location: 'Main Warehouse',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockProducts.push(newProduct);

    res.status(201).json({
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    console.error('Create product admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProductAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...updates,
      updated_at: new Date()
    };

    res.json({
      message: 'Product updated successfully',
      data: mockProducts[productIndex]
    });
  } catch (error) {
    console.error('Update product admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProductAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    mockProducts.splice(productIndex, 1);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProductStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = status;
    product.updated_at = new Date();

    res.json({
      message: 'Product status updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInventoryAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const inventory = [
      {
        id: 'inv_1',
        productId: '1',
        productName: 'MacBook Pro 16"',
        serialNumber: 'MBP001',
        status: 'available',
        condition: 'excellent',
        location: 'Mumbai Warehouse',
        purchaseDate: '2024-01-01',
        purchasePrice: 180000,
        totalRentals: 5
      }
    ];

    res.json({ data: inventory });
  } catch (error) {
    console.error('Get inventory admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateInventoryItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    res.json({
      message: 'Inventory item updated successfully',
      data: { id, ...updates, updated_at: new Date() }
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const bulkUpdateInventory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, action } = req.body;

    res.json({
      message: `Bulk ${action} completed successfully`,
      data: { updatedCount: items.length }
    });
  } catch (error) {
    console.error('Bulk update inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};