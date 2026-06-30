'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, TrendingUp, Users, Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface RevenueMonth { month: string; revenue: number; orders: number; recurringOrders: number; }
interface TopProduct { productId: string; name: string; rentals: number; revenue: number; }
interface Analytics {
  revenue: { monthly: number; quarterly: number; yearly: number; growth: number; };
  subscriptions: { active: number; paused: number; cancelled: number; total: number; };
  inventory: { total: number; available: number; rented: number; maintenance: number; };
  users: { total: number; active: number; };
  orders: { total: number; };
}

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Analytics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueMonth[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [utilization, setUtilization] = useState<number>(0);
  const [clv, setCLV] = useState<number>(0);
  const [churn, setChurn] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { };
      const [dashRes, revRes, invRes, custRes] = await Promise.all([
        fetchWithAuth(`${apiUrl}/admin/stats`, { headers }),
        fetchWithAuth(`${apiUrl}/admin/analytics/revenue`, { headers }),
        fetchWithAuth(`${apiUrl}/admin/analytics/inventory`, { headers }),
        fetchWithAuth(`${apiUrl}/admin/analytics/customers`, { headers }),
      ]);
      const [dash, rev, inv, cust] = await Promise.all([dashRes.json(), revRes.json(), invRes.json(), custRes.json()]);
      if (dash.data) setStats(dash.data);
      if (rev.data?.analytics) setRevenueData(rev.data.analytics);
      if (inv.data) {
        setTopProducts(inv.data.topPerformingProducts || []);
        setUtilization(inv.data.utilizationRate || 0);
      }
      if (cust.data) {
        setCLV(cust.data.customerLifetimeValue || 0);
        setChurn(cust.data.churnRate || 0);
      }
    } catch {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Business performance overview</p>
        </div>
        <Button variant="secondary" onClick={fetchAll} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue', value: fmt(stats?.revenue.monthly || 0), sub: `${stats?.revenue.growth || 0}% growth`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Quarterly Revenue', value: fmt(stats?.revenue.quarterly || 0), sub: 'Last 3 months', icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Users', value: stats?.users.total || 0, sub: `${stats?.users.active || 0} active`, icon: Users, color: 'text-purple-600 bg-purple-50' },
          { label: 'Total Orders', value: stats?.orders.total || 0, sub: `${stats?.subscriptions.active || 0} active subs`, icon: Package, color: 'text-orange-600 bg-orange-50' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart (bar chart with divs) */}
      {revenueData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Monthly Revenue (Last 6 months)</h2>
          <div className="flex items-end gap-3 h-48">
            {revenueData.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">{fmt(d.revenue)}</span>
                <div className="w-full rounded-t-md bg-blue-500 transition-all duration-500"
                  style={{ height: `${Math.max((d.revenue / maxRevenue) * 160, 4)}px` }} />
                <span className="text-xs text-gray-500 text-center leading-tight">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two column: top products + customer metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Top Performing Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400">No data available</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.rentals} rentals · {fmt(p.revenue)} revenue</p>
                  </div>
                  <div className="flex-shrink-0 w-24 bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((p.rentals / (topProducts[0]?.rentals || 1)) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer & Inventory Metrics */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Customer Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Avg. Lifetime Value</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{fmt(clv)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Churn Rate</p>
                <p className="text-xl font-bold text-red-600 mt-1">{churn}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Inventory Utilization</h2>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                    strokeDasharray={`${utilization} ${100 - utilization}`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900">{utilization}%</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500" /><span className="text-gray-600">Available: {stats?.inventory.available || 0}</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-gray-600">Rented: {stats?.inventory.rented || 0}</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500" /><span className="text-gray-600">Maintenance: {stats?.inventory.maintenance || 0}</span></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Subscription Breakdown</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Active', value: stats?.subscriptions.active || 0, color: 'text-green-600' },
                { label: 'Paused', value: stats?.subscriptions.paused || 0, color: 'text-yellow-600' },
                { label: 'Cancelled', value: stats?.subscriptions.cancelled || 0, color: 'text-red-600' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
