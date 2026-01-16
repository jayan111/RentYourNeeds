import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../types';
import { createAdminUser, createTestUser } from '../utils/seedAdmin';

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  resetToken?: string;
  resetTokenExpiry?: Date;
  created_at: Date;
}

let mockUsers: User[] = [];

// Initialize users on startup
const initializeUsers = async () => {
  if (mockUsers.length === 0) {
    const admin = await createAdminUser();
    const user = await createTestUser();
    mockUsers = [admin, user];
  }
};

initializeUsers();

const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.email, user.role);

    res.json({
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      role: 'user',
      created_at: new Date()
    };

    mockUsers.push(newUser);

    const token = generateToken(newUser.id, newUser.email, newUser.role);

    res.status(201).json({
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;

    // Mock email sending
    console.log(`Password reset email sent to ${email}`);
    console.log(`Reset link: http://localhost:3000/reset-password?token=${resetToken}`);

    res.json({
      message: 'Password reset email sent',
      data: {
        resetToken, // Remove in production
        resetLink: `http://localhost:3000/reset-password?token=${resetToken}`
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    const user = mockUsers.find(u => 
      u.resetToken === token && 
      u.resetTokenExpiry && 
      u.resetTokenExpiry > new Date()
    );

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({
      message: 'Token valid',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};