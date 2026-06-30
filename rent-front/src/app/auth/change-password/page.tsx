'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { validators, FormErrors, clearError } from '@/lib/validation';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    // Redirect away if not logged in or already changed password
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (!token) { router.push('/auth/login'); return; }
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (!user.must_change_password) router.push('/');
      } catch {}
    }
  }, [router]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => clearError(prev, field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: FormErrors = {
      password: validators.password(formData.password),
      confirmPassword: validators.confirmPassword(formData.confirmPassword, formData.password),
    };
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${apiUrl}/auth/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: formData.password }),
      });
      const data = await response.json();
      if (response.ok) {
        // Clear must_change_password flag in stored user
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            localStorage.setItem('user', JSON.stringify({ ...user, must_change_password: false }));
          } catch {}
        }
        router.push('/orders');
      } else {
        setServerError(data.message || 'Failed to set password. Please try again.');
      }
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Contains a number', met: /[0-9]/.test(formData.password) },
    { label: 'Passwords match', met: formData.password.length > 0 && formData.password === formData.confirmPassword },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-base">R</div>
          <span className="text-primary-800 font-semibold text-lg">RentYourNeeds</span>
        </div>

        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-7">
          <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Security step required</p>
            <p className="text-amber-700 text-xs mt-0.5">A temporary password was sent in your order email. Please set a permanent password before continuing.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your password</h2>
        <p className="text-gray-500 mb-7 text-sm">Choose a strong password you'll remember.</p>

        {serverError && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`pl-10 pr-10 input-field ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Min. 8 characters + one number"
                autoFocus
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`pl-10 pr-10 input-field ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Repeat your new password"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
          </div>

          {/* Live requirements */}
          {formData.password.length > 0 && (
            <ul className="space-y-1.5">
              {requirements.map((req) => (
                <li key={req.label} className={`flex items-center gap-2 text-xs font-medium transition-colors ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs shrink-0 ${req.met ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {req.met ? '✓' : ''}
                  </span>
                  {req.label}
                </li>
              ))}
            </ul>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : 'Set Password & Continue →'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
