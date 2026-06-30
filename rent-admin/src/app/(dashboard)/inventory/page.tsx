'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Archive, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { validators, FormErrors } from '@/lib/validation';

interface Product { id: string; name: string; }
interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  serial_number: string;
  status: string;
  condition_notes: string;
  location: string;
  assigned_order_id: string;
  created_at: string;
}

const STATUS_OPTIONS = ['available', 'rented', 'maintenance', 'damaged'];
const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide';

const statusColor = (s: string) =>
  s === 'available' ? 'bg-green-100 text-green-700' :
  s === 'rented' ? 'bg-blue-100 text-blue-700' :
  s === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
  'bg-red-100 text-red-700';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({ productId: '', serialNumber: '', status: 'available', conditionNotes: '', location: '' });
  const [addErrors, setAddErrors] = useState<FormErrors>({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      const res = await fetchWithAuth(`${apiUrl}/admin/inventory?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setInventory(data.data || []);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, selectedStatus]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${apiUrl}/admin/products?limit=200`);
      const data = await res.json();
      setProducts((data.data || []).map((p: any) => ({ id: p.id, name: p.name })));
    } catch { /* silent */ }
  }, [apiUrl]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleStatusUpdate = async (itemId: string, newStatus: string) => {
    const promise = fetchWithAuth(`${apiUrl}/admin/inventory/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
      }).then(async res => {
      if (!res.ok) throw new Error('Failed');
      fetchInventory();
    });
    toast.promise(promise, { loading: 'Updating...', success: 'Status updated', error: 'Failed to update' });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: FormErrors = {
      productId: validators.required(newItem.productId, 'Product'),
      serialNumber: validators.required(newItem.serialNumber, 'Serial number'),
      location: validators.required(newItem.location, 'Location'),
    };
    if (Object.values(errs).some(Boolean)) { setAddErrors(errs); return; }
    setAddErrors({});
    setSubmitting(true);
    try {
      const res = await fetchWithAuth(`${apiUrl}/admin/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      toast.success('Inventory item added');
      setIsAddOpen(false);
      setNewItem({ productId: '', serialNumber: '', status: 'available', conditionNotes: '', location: '' });
      fetchInventory();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSubmitting(true);
    try {
      const res = await fetchWithAuth(`${apiUrl}/admin/inventory/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editingItem.status,
          condition_notes: editingItem.condition_notes,
          location: editingItem.location
      })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      toast.success('Item updated successfully');
      setIsEditOpen(false);
      setEditingItem(null);
      fetchInventory();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">{inventory.length} items tracked</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">Filter by status:</div>
          {['all', ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button onClick={fetchInventory} className="ml-auto text-sm text-blue-600 hover:underline">Refresh</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
            Loading inventory...
          </div>
        ) : inventory.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Archive className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No inventory items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Product', 'Serial No.', 'Status', 'Condition Notes', 'Location', 'Assigned Order', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {inventory.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-900">{item.product_name || '—'}</p>
                      <p className="text-xs text-gray-400">{item.product_id}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.serial_number || '—'}</td>
                    <td className="px-4 py-3">
                      <select value={item.status} onChange={e => handleStatusUpdate(item.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColor(item.status)}`}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[180px] truncate">{item.condition_notes || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.location || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{item.assigned_order_id || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setEditingItem(item); setIsEditOpen(true); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Inventory Item" size="md">
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className={labelCls}>Product *</label>
            <select value={newItem.productId}
              onChange={e => { setNewItem({ ...newItem, productId: e.target.value }); setAddErrors(p => ({ ...p, productId: '' })); }}
              className={addErrors.productId ? 'w-full px-3 py-2 border border-red-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500' : inputCls}>
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {addErrors.productId && <p className="mt-1 text-xs text-red-600">{addErrors.productId}</p>}
          </div>
          <div>
            <label className={labelCls}>Serial Number *</label>
            <input type="text" placeholder="e.g. SN-2024-001" value={newItem.serialNumber}
              onChange={e => { setNewItem({ ...newItem, serialNumber: e.target.value }); setAddErrors(p => ({ ...p, serialNumber: '' })); }}
              className={addErrors.serialNumber ? 'w-full px-3 py-2 border border-red-500 rounded-lg text-sm focus:outline-none' : inputCls} />
            {addErrors.serialNumber && <p className="mt-1 text-xs text-red-600">{addErrors.serialNumber}</p>}
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={newItem.status}
              onChange={e => setNewItem({ ...newItem, status: e.target.value })} className={inputCls}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Condition Notes</label>
            <textarea rows={2} placeholder="Any notes about the item condition..." value={newItem.conditionNotes}
              onChange={e => setNewItem({ ...newItem, conditionNotes: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Location *</label>
            <input type="text" placeholder="e.g. Warehouse A" value={newItem.location}
              onChange={e => { setNewItem({ ...newItem, location: e.target.value }); setAddErrors(p => ({ ...p, location: '' })); }}
              className={addErrors.location ? 'w-full px-3 py-2 border border-red-500 rounded-lg text-sm focus:outline-none' : inputCls} />
            {addErrors.location && <p className="mt-1 text-xs text-red-600">{addErrors.location}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Item'}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditingItem(null); }} title="Edit Inventory Item" size="md">
        {editingItem && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-gray-900">{editingItem.product_name}</p>
              <p className="text-gray-500 text-xs mt-0.5">Serial: {editingItem.serial_number || 'N/A'}</p>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={editingItem.status}
                onChange={e => setEditingItem({ ...editingItem, status: e.target.value })} className={inputCls}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Condition Notes</label>
              <textarea rows={2} value={editingItem.condition_notes || ''}
                onChange={e => setEditingItem({ ...editingItem, condition_notes: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input type="text" value={editingItem.location || ''}
                onChange={e => setEditingItem({ ...editingItem, location: e.target.value })} className={inputCls} />
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button type="button" variant="secondary" onClick={() => { setIsEditOpen(false); setEditingItem(null); }}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
