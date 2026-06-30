'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { validators, FormErrors } from '@/lib/validation';

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const inputErrCls = 'w-full px-3 py-2 border border-red-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide';

interface SettingsData {
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  currency: string;
  gst_number: string;
  late_fee_percent: string;
  damage_deposit_percent: string;
  min_rental_days: string;
  max_rental_months: string;
}

const DEFAULT: SettingsData = {
  business_name: 'RentYourNeeds',
  business_email: '',
  business_phone: '',
  business_address: '',
  currency: 'INR',
  gst_number: '',
  late_fee_percent: '5',
  damage_deposit_percent: '20',
  min_rental_days: '1',
  max_rental_months: '24'
      };

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({ ...DEFAULT });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${apiUrl}/admin/settings`);
      const data = await res.json();
      if (data.data && Object.keys(data.data).length > 0) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    } catch { /* use defaults */ } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: FormErrors = {
      business_name: validators.required(settings.business_name, 'Business name'),
      business_email: settings.business_email ? validators.email(settings.business_email) : '',
      business_phone: settings.business_phone ? validators.phone(settings.business_phone) : '',
    };
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetchWithAuth(`${apiUrl}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');
      toast.success('Settings saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key: keyof SettingsData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setSettings(prev => ({ ...prev, [key]: e.target.value }));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure your rental business</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">Business Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Business Name</label>
              <input type="text" value={settings.business_name} onChange={(e) => { set('business_name')(e); setErrors(p => ({ ...p, business_name: '' })); }} className={errors.business_name ? inputErrCls : inputCls} />
              {errors.business_name && <p className="mt-1 text-xs text-red-600">{errors.business_name}</p>}
            </div>
            <div>
              <label className={labelCls}>Business Email</label>
              <input type="email" value={settings.business_email} onChange={(e) => { set('business_email')(e); setErrors(p => ({ ...p, business_email: '' })); }} placeholder="contact@example.com" className={errors.business_email ? inputErrCls : inputCls} />
              {errors.business_email && <p className="mt-1 text-xs text-red-600">{errors.business_email}</p>}
            </div>
            <div>
              <label className={labelCls}>Business Phone</label>
              <input type="tel" value={settings.business_phone} onChange={(e) => { set('business_phone')(e); setErrors(p => ({ ...p, business_phone: '' })); }} placeholder="+91 9876543210" className={errors.business_phone ? inputErrCls : inputCls} />
              {errors.business_phone && <p className="mt-1 text-xs text-red-600">{errors.business_phone}</p>}
            </div>
            <div>
              <label className={labelCls}>GST Number</label>
              <input type="text" value={settings.gst_number} onChange={set('gst_number')} placeholder="22AAAAA0000A1Z5" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Business Address</label>
              <textarea value={settings.business_address} onChange={set('business_address')} rows={2}
                placeholder="Full business address..." className={inputCls} />
            </div>
          </div>
        </div>

        {/* Rental Policy */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">Rental Policy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Currency</label>
              <select value={settings.currency} onChange={set('currency')} className={inputCls}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Late Fee (%)</label>
              <input type="number" min="0" max="100" step="0.5" value={settings.late_fee_percent} onChange={set('late_fee_percent')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Damage Deposit (%)</label>
              <input type="number" min="0" max="100" step="1" value={settings.damage_deposit_percent} onChange={set('damage_deposit_percent')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Min Rental Days</label>
              <input type="number" min="1" value={settings.min_rental_days} onChange={set('min_rental_days')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Max Rental Months</label>
              <input type="number" min="1" max="60" value={settings.max_rental_months} onChange={set('max_rental_months')} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
