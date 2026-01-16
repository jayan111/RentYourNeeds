import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    priceRange: [number, number];
    rating: number;
  };
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  filters: {
    category: '',
    priceRange: [0, 1000],
    rating: 0,
  },
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    setFilters: (state, action: PayloadAction<Partial<ProductState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setProducts, setLoading, setError, setFilters } = productSlice.actions;
export default productSlice.reducer;