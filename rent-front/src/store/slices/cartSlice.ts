import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

const loadCartFromStorage = (): CartState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cart');
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return { items: [], total: 0, itemCount: 0 };
};

const saveCartToStorage = (state: CartState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(state));
  }
};

const initialState: CartState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number; rentalDays?: number; tenureMonths?: number }>) => {
      const { product, quantity, rentalDays = 1, tenureMonths } = action.payload;
      const itemId = tenureMonths ? `${product.id}-${tenureMonths}m` : `${product.id}-${rentalDays}d`;
      const existingItem = state.items.find(item => item.id === itemId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id: itemId,
          productId: product.id,
          product,
          quantity,
          price: product.price,
          rentalDays: tenureMonths ? undefined : rentalDays,
          tenureMonths,
        });
      }
      
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    },
    
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      saveCartToStorage(state);
    },
    
    calculateTotals: (state) => {
      state.total = state.items.reduce((sum, item) => {
        if (item.tenureMonths) {
          // For subscription: price per day * 30 days * months * quantity
          const monthlyPrice = item.price * 30;
          return sum + (monthlyPrice * item.tenureMonths * item.quantity);
        } else {
          // For regular rental: price per day * days * quantity
          const rentalDays = item.rentalDays || 1;
          return sum + (item.price * item.quantity * rentalDays);
        }
      }, 0);
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    
    loadCart: (state) => {
      const loaded = loadCartFromStorage();
      state.items = loaded.items;
      state.total = loaded.total;
      state.itemCount = loaded.itemCount;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, loadCart } = cartSlice.actions;
export default cartSlice.reducer;