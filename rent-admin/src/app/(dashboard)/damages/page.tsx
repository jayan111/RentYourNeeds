'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface DamageReport {
  id: string;
  inventory_id: string;
  subscription_id: string;
  user_id: string;
  description: string;
  severity: string;
  repair_cost: number;
  charged_amount: number;
  status: string;
  images: string;
  created_at: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  minor: 'bg-yellow-100 text-yellow-700',
  major: 'bg-orange-100 text-orange-700',
  total_loss: 'bg-red-100 text-red-700'
      };

const STATUS_COLORS: Record<string, string> = {
  reported: 'bg-blue-100 text-blue-700',
  assessed: 'bg-purple-100 text-purple-700',
  charged: 'bg-orange-100 text-orange-700',
  resolved: 'bg-green-100 text-green-700'
      };

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide';

export default function DamagesPage() {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [editing, setEditing] = useState<DamageReport | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      const res = await fetchWithAuth(`${apiUrl}/admin/damages?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setReports(data.data || []);
    } catch {
      toast.error('Failed to load damage reports');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, statusFilter, severityFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleQuickStatusUpdate = async (id: string, newStatus: string) => {
    const promise = fetchWithAuth(`${apiUrl}/admin/damages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
      }).then(async res => {
      if (!res.ok) throw new Error('Failed');
      fetchReports();
    });
    toast.promise(promise, { loading: 'Updating...', success: 'Status updated', error: 'Failed to update' });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    try {
      const res = await fetchWithAuth(`${apiUrl}/admin/damages/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editing.status,
          repair_cost: Number(editing.repair_cost),
          charged_amount: Number(editing.charged_amount)
      })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      toast.success('Damage report updated');
      setIsEditOpen(false);
      setEditing(null);
      fetchReports();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: reports.length,
    reported: reports.filter(r => r.status === 'reported').length,
    assessed: reports.filter(r => r.status === 'assessed').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    totalCost: reports.reduce((s, r) => s + (Number(r.repair_cost) || 0), 0)
      };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Damage Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">{reports.length} total reports</p>
        </div>
        <Button variant="secondary" onClick={fetchReports}>Refresh</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900' },
          { label: 'Reported', value: stats.reported, color: 'text-blue-600' },
          { label: 'Assessed', value: stats.assessed, color: 'text-purple-600' },
          { label: 'Resolved', value: stats.resolved, color: 'text-green-600' },
          { label: 'Total Cost', value: `₹${stats.totalCost.toLocaleString('en-IN')}`, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-gray-500 uppercase">Status:</span>
          {['all', 'reported', 'assessed', 'charged', 'resolved'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-gray-500 uppercase">Severity:</span>
          {['all', 'minor', 'major', 'total_loss'].map(s => (
            <button key={s} onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${severityFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
            Loading...
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No damage reports found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['ID', 'Inventory', 'Description', 'Severity', 'Repair Cost', 'Charged', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {reports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{report.id.slice(-8)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{report.inventory_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[180px] truncate" title={report.description}>{report.description}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[report.severity] || 'bg-gray-100 text-gray-600'}`}>
                        {report.severity?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {report.repair_cost ? `₹${Number(report.repair_cost).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {report.charged_amount ? `₹${Number(report.charged_amount).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select value={report.status} onChange={e => handleQuickStatusUpdate(report.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-600'}`}>
                        {['reported', 'assessed', 'charged', 'resolved'].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(report.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setEditing({ ...report }); setIsEditOpen(true); }}
                        className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditing(null); }} title="Update Damage Report" size="md">
        {editing && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-gray-900 mb-1">Description</p>
              <p className="text-gray-600">{editing.description}</p>
              <p className="text-xs text-gray-400 mt-1">Severity: {editing.severity?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} className={inputCls}>
                {['reported', 'assessed', 'charged', 'resolved'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Repair Cost (₹)</label>
                <input type="number" min="0" step="0.01" value={editing.repair_cost || 0}
                  onChange={e => setEditing({ ...editing, repair_cost: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Charged Amount (₹)</label>
                <input type="number" min="0" step="0.01" value={editing.charged_amount || 0}
                  onChange={e => setEditing({ ...editing, charged_amount: Number(e.target.value) })} className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button type="button" variant="secondary" onClick={() => { setIsEditOpen(false); setEditing(null); }}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
