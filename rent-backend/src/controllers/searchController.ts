import { Request, Response } from 'express';

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.json({ data: [], suggestions: [] });
    }
    
    const searchTerm = q.toLowerCase().trim();
    
    // Mock search suggestions and results
    const mockSuggestions = [
      'MacBook Pro',
      'iPad Pro',
      'iPhone 15',
      'Canon Camera',
      'Tesla Model 3',
      'Herman Miller Chair',
      'Standing Desk',
      'Mountain Bike',
      'DJI Drone',
      'Sony Camera'
    ];
    
    const suggestions = mockSuggestions
      .filter(suggestion => suggestion.toLowerCase().includes(searchTerm))
      .slice(0, parseInt(limit as string));
    
    // Mock quick search results
    const quickResults = [
      {
        id: '1',
        name: 'MacBook Pro 16"',
        category: 'electronics',
        price: 50,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200'
      },
      {
        id: '4',
        name: 'Canon EOS R5',
        category: 'photography',
        price: 75,
        image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=200'
      }
    ].filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    ).slice(0, 5);
    
    res.json({
      data: quickResults,
      suggestions,
      query: q
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
};

export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.json({ suggestions: [] });
    }
    
    const searchTerm = q.toLowerCase();
    
    // Mock popular searches and categories
    const popularSearches = [
      'MacBook Pro',
      'Camera',
      'Laptop',
      'Drone',
      'Chair',
      'Desk',
      'Car',
      'Bike',
      'iPhone',
      'iPad'
    ];
    
    const categories = [
      'electronics',
      'photography',
      'furniture',
      'vehicles'
    ];
    
    const suggestions = [
      ...popularSearches.filter(term => term.toLowerCase().includes(searchTerm)),
      ...categories.filter(cat => cat.includes(searchTerm)).map(cat => `in ${cat}`)
    ].slice(0, 8);
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ message: 'Failed to get suggestions' });
  }
};