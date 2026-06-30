'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId: string;
  productId: string;
  productName: string;
  status: string;
  startDate: string;
  endDate: string;
  tenureMonths: number;
  monthlyAmount: number;
  totalAmount: number;
  createdAt: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ active: 0, paused: 0, cancelled: 0, total: 0 });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    fetchSubscriptions();
  }, [selectedStatus]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '50' });
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const response = await fetchWithAuth(`${apiUrl}/admin/subscriptions?${params}`);
      const data = await response.json();
      const subs: Subscription[] = data.data || [];
      setSubscriptions(subs);

      const active = subs.filter(s => s.status === 'active').length;
      const paused = subs.filter(s => s.status === 'paused').length;
      const cancelled = subs.filter(s => s.status === 'cancelled').length;
      setStats({ active, paused, cancelled, total: subs.length });
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (subId: string, newStatus: string) => {
    const promise = fetchWithAuth(`${apiUrl}/admin/subscriptions/${subId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
      }).then(async res => {
      if (!res.ok) throw new Error('Failed');
      fetchSubscriptions();
    });
    toast.promise(promise, { loading: 'Updating...', success: 'Subscription updated', error: 'Failed to update subscription' });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions Management</h1>
        <Button onClick={fetchSubscriptions}>Refresh</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Paused</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium text-gray-700">Filter by status:</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading subscriptions...</div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No subscriptions found</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Product</TableHeaderCell>
                <TableHeaderCell>Customer</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Monthly</TableHeaderCell>
                <TableHeaderCell>Tenure</TableHeaderCell>
                <TableHeaderCell>Start</TableHeaderCell>
                <TableHeaderCell>End</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <span className="font-mono text-xs text-gray-500">{sub.id.slice(0, 12)}...</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{sub.productName || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{sub.userName || '-'}</div>
                    <div className="text-xs text-gray-500">{sub.userEmail || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell className="font-semibold text-sm">
                    {formatCurrency(sub.monthlyAmount)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {sub.tenureMonths} mo
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(sub.startDate)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(sub.endDate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => { setSelectedSub(sub); setIsModalOpen(true); }}>
                        View
                      </Button>
                      <select
                        value={sub.status}
                        onChange={(e) => handleStatusUpdate(sub.id, e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="active">Active</option>
                        <option value="paused">Pause</option>
                        <option value="cancelled">Cancel</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Subscription Details" size="lg">
        {selectedSub && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Subscription ID</p>
                <p className="text-sm text-gray-900 font-mono">{selectedSub.id}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                <StatusBadge status={selectedSub.status} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Customer</p>
                <p className="text-sm text-gray-900">{selectedSub.userName}</p>
                <p className="text-xs text-gray-500">{selectedSub.userEmail}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Product</p>
                <p className="text-sm text-gray-900">{selectedSub.productName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Monthly Amount</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedSub.monthlyAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total Amount</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(selectedSub.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Tenure</p>
                <p className="text-sm text-gray-900">{selectedSub.tenureMonths} months</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Period</p>
                <p className="text-sm text-gray-900">{formatDate(selectedSub.startDate)} → {formatDate(selectedSub.endDate)}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              {selectedSub.status === 'active' && (
                <Button variant="secondary" onClick={() => { handleStatusUpdate(selectedSub.id, 'paused'); setIsModalOpen(false); }}>
                  Pause
                </Button>
              )}
              {selectedSub.status === 'paused' && (
                <Button onClick={() => { handleStatusUpdate(selectedSub.id, 'active'); setIsModalOpen(false); }}>
                  Resume
                </Button>
              )}
              {selectedSub.status !== 'cancelled' && (
                <Button variant="secondary" onClick={() => { handleStatusUpdate(selectedSub.id, 'cancelled'); setIsModalOpen(false); }}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
