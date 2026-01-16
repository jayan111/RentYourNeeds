import { Request, Response } from 'express';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = [
      {
        id: 'electronics',
        name: 'Electronics',
        description: 'Laptops, phones, tablets and more',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
        productCount: 156
      },
      {
        id: 'photography',
        name: 'Photography',
        description: 'Cameras, lenses, drones and equipment',
        image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
        productCount: 89
      },
      {
        id: 'furniture',
        name: 'Furniture',
        description: 'Chairs, desks, sofas and home decor',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        productCount: 234
      },
      {
        id: 'vehicles',
        name: 'Vehicles',
        description: 'Cars, bikes, scooters and transport',
        image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400',
        productCount: 67
      }
    ];

    res.json({ data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};