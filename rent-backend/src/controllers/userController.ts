import { Response } from 'express';
import { User, KYCDocument, AuthenticatedRequest } from '../types';

const mockUsers: User[] = [
  {
    id: 'user_1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91-9876543210',
    address: {
      street: '123 MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    kycStatus: 'verified',
    kycDocuments: [
      {
        type: 'aadhar',
        number: '1234-5678-9012',
        imageUrl: '/uploads/aadhar_123.jpg',
        verified: true
      }
    ],
    creditScore: 750,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'user_1';
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'user_1';
    const { name, phone, address } = req.body;
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };
    user.updated_at = new Date();

    res.json({
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadKYCDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'user_1';
    const { type, number, imageUrl } = req.body;
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const kycDoc: KYCDocument = {
      type,
      number,
      imageUrl,
      verified: false
    };

    // Remove existing document of same type
    user.kycDocuments = user.kycDocuments.filter(doc => doc.type !== type);
    user.kycDocuments.push(kycDoc);
    user.kycStatus = 'pending';
    user.updated_at = new Date();

    res.json({
      message: 'KYC document uploaded successfully',
      data: kycDoc
    });
  } catch (error) {
    console.error('Upload KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyKYC = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { documentType, status, remarks } = req.body;
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const document = user.kycDocuments.find(doc => doc.type === documentType);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.verified = status === 'approved';
    
    // Check if all required documents are verified
    const requiredDocs = ['aadhar', 'pan'];
    const allVerified = requiredDocs.every(type => 
      user.kycDocuments.some(doc => doc.type === type && doc.verified)
    );

    user.kycStatus = allVerified ? 'verified' : status === 'rejected' ? 'rejected' : 'pending';
    user.updated_at = new Date();

    res.json({
      message: 'KYC verification updated successfully',
      data: { user, remarks }
    });
  } catch (error) {
    console.error('Verify KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { kycStatus, page = 1, limit = 20 } = req.query;
    let users = [...mockUsers];

    if (kycStatus) {
      users = users.filter(user => user.kycStatus === kycStatus);
    }

    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedUsers = users.slice(startIndex, endIndex);

    res.json({
      data: paginatedUsers,
      total: users.length,
      page: parseInt(page as string),
      totalPages: Math.ceil(users.length / parseInt(limit as string))
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = {
      totalUsers: mockUsers.length,
      verifiedUsers: mockUsers.filter(u => u.kycStatus === 'verified').length,
      pendingKYC: mockUsers.filter(u => u.kycStatus === 'pending').length,
      rejectedKYC: mockUsers.filter(u => u.kycStatus === 'rejected').length
    };

    res.json({ data: stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};