export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  status: 'available' | 'rented_out' | 'sold_out' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  serialNumber: string;
  status: 'available' | 'rented_out' | 'maintenance' | 'retired';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  purchaseDate: string;
  purchasePrice: number;
  totalRentals: number;
  lastRented?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  monthlyAmount: number;
  totalAmount: number;
  created_at: string;
}

export interface DashboardStats {
  revenue: {
    monthly: number;
    quarterly: number;
    yearly: number;
    growth: number;
  };
  subscriptions: {
    active: number;
    paused: number;
    cancelled: number;
    total: number;
  };
  inventory: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    retired: number;
  };
  users: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}