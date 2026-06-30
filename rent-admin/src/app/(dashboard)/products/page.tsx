'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Star, Package, RefreshCw, X, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryName?: string;
  stock: number;
  rating: number;
  reviews: number;
  images: string[];
  condition: string;
  location: string;
  availability: string;
  is_active: boolean;
  created_at: string;
}

const CONDITION_OPTIONS = ['Excellent', 'Very Good', 'Good', 'Fair'];
const STATUS_OPTIONS = ['all', 'available', 'rented', 'maintenance', 'retired', 'inactive'];
const AVAILABILITY_OPTIONS = ['available', 'rented', 'maintenance', 'retired'];

const emptyProduct = {
  name: '',
  description: '',
  price: 0,
  category: '',
  stock: 0,
  condition: 'Excellent',
  location: '',
  availability: 'available',
  subscription_durations: [3, 6, 12],
};

const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white';
const labelCls = 'block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide';

/* ── Skeleton row ── */
function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-gray-100">
      {[160, 80, 72, 64, 80, 72, 80, 48, 72].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Image thumbnail grid ── */
function ImageGrid({
  images,
  onRemove,
  imageUrl,
}: {
  images: string[];
  onRemove: (i: number) => void;
  imageUrl: (s: string) => string;
}) {
  if (!images.length) return null;
  return (
    <div className="mt-2 grid grid-cols-4 gap-2">
      {images.map((src, i) => (
        <div key={i} className="relative group aspect-square">
          <img
            src={src.startsWith('data:') ? src : imageUrl(src)}
            alt={`img-${i}`}
            className="w-full h-full object-cover rounded-lg border border-gray-200 transition-opacity group-hover:opacity-80"
            onError={e => {
              (e.currentTarget as HTMLImageElement).src =
                `https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Img`;
            }}
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs
                       opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ ...emptyProduct });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const API_BASE = apiUrl.replace('/api', '');

  /** Return full URL for an image path (handles http:// or relative) */
  const imageUrl = (img: string) =>
    !img
      ? ''
      : img.startsWith('http')
      ? img
      : `${API_BASE}/${img.replace(/^\/+/, '')}`;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${apiUrl}/categories`);
      const data = await res.json();
      setCategories(data.data || data || []);
    } catch {
      setCategories([]);
    }
  }, [apiUrl]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: '1', limit: '100' });
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetchWithAuth(`${apiUrl}/admin/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data.data || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, selectedStatus, selectedCategory, searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ── Add product: image select ── */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev =>
        setImageUrls(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeNewImage = (i: number) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImageUrls(prev => prev.filter((_, idx) => idx !== i));
  };

  /* ── Add product submit ── */
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.category) {
      toast.error('Please select a category');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(newProduct).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, String(v));
      });
      imageFiles.forEach(f => fd.append('images', f));

      const res = await fetchWithAuth(`${apiUrl}/admin/products`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add product');

      toast.success('Product added successfully');
      setIsAddModalOpen(false);
      setNewProduct({ ...emptyProduct });
      setImageFiles([]);
      setImageUrls([]);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Edit product: image select ── */
  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setEditImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev =>
        setEditImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeExistingEditImage = (i: number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      images: editingProduct.images.filter((_, idx) => idx !== i),
    });
  };

  const removeNewEditImage = (i: number) => {
    setEditImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setEditImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  /* ── Edit product submit ── */
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', editingProduct.name);
      fd.append('description', editingProduct.description);
      fd.append('price', String(editingProduct.price));
      fd.append('category', editingProduct.category);
      fd.append('stock', String(editingProduct.stock));
      fd.append('condition', editingProduct.condition);
      fd.append('location', editingProduct.location || '');
      fd.append('availability', editingProduct.availability);

      // Convert full URLs back to relative paths for storage
      const existingPaths = editingProduct.images
        .filter(img => !img.startsWith('data:'))
        .map(img =>
          img.startsWith('http')
            ? img.replace(`${API_BASE}/`, '').replace(API_BASE, '')
            : img
        );

      // Use 'existingImages' (not 'images') to avoid collision with multer file fields
      fd.append('existingImages', JSON.stringify(existingPaths));

      // New image files go under 'images' field — multer picks them up
      editImageFiles.forEach(f => fd.append('images', f));

      const res = await fetchWithAuth(`${apiUrl}/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update product');

      toast.success('Product updated successfully');
      setIsEditModalOpen(false);
      setEditingProduct(null);
      setEditImageFiles([]);
      setEditImagePreviews([]);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ── */
  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const promise = fetchWithAuth(`${apiUrl}/admin/products/${productId}`, {
      method: 'DELETE',
      }).then(async res => {
      if (!res.ok) throw new Error('Failed to delete');
      fetchProducts();
    });
    toast.promise(promise, {
      loading: 'Deleting...',
      success: 'Product deleted',
      error: 'Failed to delete product',
    });
  };

  const openEditModal = (product: Product) => {
    setEditingProduct({ ...product, images: [...(product.images || [])] });
    setEditImageFiles([]);
    setEditImagePreviews([]);
    setIsEditModalOpen(true);
  };

  const categoryName = (id: string) =>
    categories.find(c => c.id === id)?.name || id;

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading...' : `${products.length} products total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className={inputCls}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className={inputCls}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'Product',
                  'Category',
                  'Price',
                  'Stock',
                  'Condition',
                  'Location',
                  'Status',
                  'Rating',
                  'Actions',
                ].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No products found</p>
                    <p className="text-sm">Try adjusting your filters or add a new product</p>
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr
                    key={product.id}
                    className="hover:bg-blue-50/30 transition-colors duration-150"
                  >
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img
                            src={imageUrl(product.images[0])}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                            onError={e => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://placehold.co/40x40/f3f4f6/9ca3af?text=Img';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate max-w-[160px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {product.categoryName || categoryName(product.category)}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-gray-900 text-sm">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-gray-400">/mo</span>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.stock > 5
                            ? 'bg-green-100 text-green-700'
                            : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>

                    {/* Condition */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          product.condition === 'Excellent'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : product.condition === 'Very Good'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : product.condition === 'Good'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        {product.condition}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {product.location || '—'}
                    </td>

                    {/* Availability */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.availability === 'available'
                            ? 'bg-green-100 text-green-700'
                            : product.availability === 'rented'
                            ? 'bg-blue-100 text-blue-700'
                            : product.availability === 'maintenance'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.availability}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">
                          {product.rating ? Number(product.rating).toFixed(1) : '—'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ Add Product Modal ══ */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setImageFiles([]);
          setImageUrls([]);
        }}
        title="Add New Product"
        size="lg"
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sony A7 III Camera"
                value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Category *</label>
              <select
                required
                value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                className={inputCls}
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Price (₹/month) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0"
                value={newProduct.price || ''}
                onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Stock *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="0"
                value={newProduct.stock || ''}
                onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Condition</label>
              <select
                value={newProduct.condition}
                onChange={e => setNewProduct({ ...newProduct, condition: e.target.value })}
                className={inputCls}
              >
                {CONDITION_OPTIONS.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={newProduct.location}
                onChange={e => setNewProduct({ ...newProduct, location: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Availability</label>
              <select
                value={newProduct.availability}
                onChange={e => setNewProduct({ ...newProduct, availability: e.target.value })}
                className={inputCls}
              >
                {AVAILABILITY_OPTIONS.map(a => (
                  <option key={a} value={a}>
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Describe the product..."
              value={newProduct.description}
              onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Product Images (max 20 MB each)</label>
            <label className="mt-1 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
              <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Click to upload images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
            <ImageGrid images={imageUrls} onRemove={removeNewImage} imageUrl={imageUrl} />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setImageFiles([]);
                setImageUrls([]);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                'Add Product'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ══ Edit Product Modal ══ */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditImageFiles([]);
          setEditImagePreviews([]);
        }}
        title="Edit Product"
        size="lg"
      >
        {editingProduct && (
          <form onSubmit={handleEditProduct} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Category *</label>
                <select
                  required
                  value={editingProduct.category}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, category: e.target.value })
                  }
                  className={inputCls}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Price (₹/month) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Stock *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editingProduct.stock}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Condition</label>
                <select
                  value={editingProduct.condition}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, condition: e.target.value })
                  }
                  className={inputCls}
                >
                  {CONDITION_OPTIONS.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input
                  type="text"
                  value={editingProduct.location || ''}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, location: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Availability</label>
                <select
                  value={editingProduct.availability}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, availability: e.target.value })
                  }
                  className={inputCls}
                >
                  {AVAILABILITY_OPTIONS.map(a => (
                    <option key={a} value={a}>
                      {a.charAt(0).toUpperCase() + a.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Description *</label>
              <textarea
                required
                rows={3}
                value={editingProduct.description}
                onChange={e =>
                  setEditingProduct({ ...editingProduct, description: e.target.value })
                }
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                Images{' '}
                <span className="text-gray-400 font-normal normal-case">
                  (hover to remove)
                </span>
              </label>

              {/* Existing images (from API — full http URLs) */}
              <ImageGrid
                images={editingProduct.images}
                onRemove={removeExistingEditImage}
                imageUrl={imageUrl}
              />

              {/* New images (data: previews) */}
              <ImageGrid
                images={editImagePreviews}
                onRemove={removeNewEditImage}
                imageUrl={imageUrl}
              />

              <label className="mt-2 flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                <ImagePlus className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add more images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEditImageSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditImageFiles([]);
                  setEditImagePreviews([]);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
