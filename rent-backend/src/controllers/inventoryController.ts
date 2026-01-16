import { Response } from 'express';
import { Inventory, MaintenanceRequest, Damage, AuthenticatedRequest } from '../types';

const mockInventory: Inventory[] = [
  {
    id: 'inv_1',
    productId: '1',
    serialNumber: 'SN001',
    condition: 'new',
    status: 'available',
    purchaseDate: new Date('2024-01-01'),
    purchasePrice: 50000,
    totalRentals: 0,
    location: 'Mumbai Warehouse',
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockMaintenanceRequests: MaintenanceRequest[] = [];
const mockDamages: Damage[] = [];

export const getInventory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, status, location } = req.query;
    let inventory = [...mockInventory];

    if (productId) {
      inventory = inventory.filter(item => item.productId === productId);
    }
    if (status) {
      inventory = inventory.filter(item => item.status === status);
    }
    if (location) {
      inventory = inventory.filter(item => item.location === location);
    }

    res.json({
      data: inventory,
      total: inventory.length
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addInventoryItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, serialNumber, condition, purchasePrice, location } = req.body;

    const inventoryItem: Inventory = {
      id: `inv_${Date.now()}`,
      productId,
      serialNumber,
      condition,
      status: 'available',
      purchaseDate: new Date(),
      purchasePrice,
      totalRentals: 0,
      location,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockInventory.push(inventoryItem);

    res.status(201).json({
      message: 'Inventory item added successfully',
      data: inventoryItem
    });
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateInventoryStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, condition, location } = req.body;

    const item = mockInventory.find(inv => inv.id === id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (status) item.status = status;
    if (condition) item.condition = condition;
    if (location) item.location = location;
    item.updated_at = new Date();

    res.json({
      message: 'Inventory updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createMaintenanceRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subscriptionId, productId, inventoryId, issue, priority } = req.body;

    const maintenanceRequest: MaintenanceRequest = {
      id: `maint_${Date.now()}`,
      subscriptionId,
      userId: req.user?.id || 'user_1',
      productId,
      inventoryId,
      issue,
      priority,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockMaintenanceRequests.push(maintenanceRequest);

    res.status(201).json({
      message: 'Maintenance request created successfully',
      data: maintenanceRequest
    });
  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMaintenanceRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority } = req.query;
    let requests = [...mockMaintenanceRequests];

    if (status) {
      requests = requests.filter(req => req.status === status);
    }
    if (priority) {
      requests = requests.filter(req => req.priority === priority);
    }

    res.json({
      data: requests,
      total: requests.length
    });
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const reportDamage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { inventoryId, subscriptionId, description, severity, images } = req.body;

    const damage: Damage = {
      id: `dmg_${Date.now()}`,
      inventoryId,
      subscriptionId,
      userId: req.user?.id || 'user_1',
      description,
      severity,
      repairCost: 0,
      chargedAmount: 0,
      images: images || [],
      status: 'reported',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockDamages.push(damage);

    res.status(201).json({
      message: 'Damage reported successfully',
      data: damage
    });
  } catch (error) {
    console.error('Report damage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDamageReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, severity } = req.query;
    let damages = [...mockDamages];

    if (status) {
      damages = damages.filter(dmg => dmg.status === status);
    }
    if (severity) {
      damages = damages.filter(dmg => dmg.severity === severity);
    }

    res.json({
      data: damages,
      total: damages.length
    });
  } catch (error) {
    console.error('Get damage reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};