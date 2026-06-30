'use client';

import { useEffect, useState } from 'react';
import {
  CreditCard,
  FileText,
  Car,
  Landmark,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  User,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';

// ---- Types ----
type DocType = 'aadhaar' | 'pan' | 'driving_license' | 'passport';
type KYCStatus = 'pending' | 'under_review' | 'verified' | 'rejected';

interface KYCRecord {
  id: string;
  status: KYCStatus;
  document_type: DocType;
  submitted_at: string;
  rejection_reason?: string;
}

const DOC_OPTIONS: { id: DocType; label: string; description: string; icon: React.ReactNode; placeholder: string }[] = [
  { id: 'aadhaar', label: 'Aadhaar Card', description: '12-digit government ID', icon: <Landmark className="w-6 h-6" />, placeholder: 'XXXX XXXX XXXX' },
  { id: 'pan', label: 'PAN Card', description: 'Permanent Account Number', icon: <CreditCard className="w-6 h-6" />, placeholder: 'ABCDE1234F' },
  { id: 'driving_license', label: 'Driving License', description: 'Valid driving licence', icon: <Car className="w-6 h-6" />, placeholder: 'DL-XXXXXXXXXXXXX' },
  { id: 'passport', label: 'Passport', description: 'Indian / International', icon: <FileText className="w-6 h-6" />, placeholder: 'A1234567' },
];

const DOC_LABELS: Record<DocType, string> = {
  aadhaar: 'Aadhaar Number',
  pan: 'PAN Number',
  driving_license: 'License Number',
  passport: 'Passport Number',
};

const STEP_LABELS = ['Document Details', 'Personal Info', 'Review & Submit'];

// ---- Status Display ----
function KYCStatusDisplay({ record, onResubmit }: { record: KYCRecord; onResubmit: () => void }) {
  const cfg: Record<KYCStatus, { color: string; bg: string; icon: React.ReactNode; title: string; sub: string }> = {
    pending: { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: <Clock className="w-8 h-8 text-yellow-500" />, title: 'Under Review', sub: 'Your KYC is being reviewed. We\'ll notify you within 24-48 hours.' },
    under_review: { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: <Clock className="w-8 h-8 text-yellow-500" />, title: 'Under Review', sub: 'Our team is verifying your documents. This usually takes 24-48 hours.' },
    verified: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: <CheckCircle className="w-8 h-8 text-green-500" />, title: 'KYC Verified', sub: 'Your identity has been successfully verified. You\'re all set to rent!' },
    rejected: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: <XCircle className="w-8 h-8 text-red-500" />, title: 'KYC Rejected', sub: record.rejection_reason || 'Your KYC was rejected. Please resubmit with correct documents.' },
  };
  const c = cfg[record.status];

  return (
    <div className={`max-w-lg mx-auto mt-8 rounded-2xl border-2 p-8 text-center ${c.bg}`}>
      <div className="flex justify-center mb-4">{c.icon}</div>
      <h2 className={`text-2xl font-bold mb-2 ${c.color}`}>{c.title}</h2>
      <p className={`text-sm mb-4 ${c.color}`}>{c.sub}</p>
      <p className="text-xs text-gray-500 mb-6">
        Submitted: {new Date(record.submitted_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {record.status === 'rejected' && (
          <button onClick={onResubmit} className="btn-primary">
            Resubmit KYC
          </button>
        )}
        <Link href="/products" className="btn-secondary text-center">
          Browse Products
        </Link>
        <Link href="/orders" className="btn-secondary text-center">
          My Orders
        </Link>
      </div>
    </div>
  );
}

// ---- Main ----
export default function KYCPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingKYC, setExistingKYC] = useState<KYCRecord | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [docType, setDocType] = useState<DocType>('aadhaar');
  const [docNumber, setDocNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    // Pre-fill from localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.name) setFullName(user.name);
        if (user.email) setEmail(user.email);
      }
    } catch {}

    checkKYCStatus();
  }, []);

  const checkKYCStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/kyc/status`, { headers });
      if (res.status === 404) {
        setExistingKYC(null);
      } else if (res.ok) {
        const data = await res.json();
        if (data.data) setExistingKYC(data.data);
      }
    } catch {
      // no existing KYC — that's fine
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/kyc`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          documentType: docType,
          documentNumber: docNumber,
          fullName,
          dateOfBirth: dob,
          address,
          email,
        }),
      });
      const data = await res.json();
      if (res.ok || res.status === 201) {
        setSubmitted(true);
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => { setDirection(1); setStep(s => s + 1); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };

  // ---- Loading ----
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="mt-3 text-gray-500">Checking KYC status…</p>
      </div>
    );
  }

  // ---- Existing KYC ----
  if (existingKYC && !showForm) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
        <p className="text-gray-500 mb-4">Identity verification status</p>
        <KYCStatusDisplay record={existingKYC} onResubmit={() => setShowForm(true)} />
      </div>
    );
  }

  // ---- Success ----
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-50 border-2 border-green-200 rounded-2xl p-10"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">KYC Submitted Successfully!</h2>
          <p className="text-green-600 mb-6">
            Your verification is under review. We&apos;ll notify you within 24-48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products" className="btn-primary text-center">
              Browse Products
            </Link>
            <Link href="/orders" className="btn-secondary text-center">
              My Orders
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---- Multi-step form ----
  const selectedDoc = DOC_OPTIONS.find(d => d.id === docType)!;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">KYC Verification</h1>
      <p className="text-gray-500 mb-8">Complete identity verification to start renting</p>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEP_LABELS.map((label, i) => {
          const num = i + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    isDone
                      ? 'bg-primary-600 text-white'
                      : isActive
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isDone ? <CheckCircle className="w-5 h-5" /> : num}
                </div>
                <p className={`text-xs mt-1 font-medium hidden sm:block ${isActive ? 'text-primary-600' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                  {label}
                </p>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > num ? 'bg-primary-600' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              <h2 className="text-xl font-semibold mb-1">Document Details</h2>
              <p className="text-sm text-gray-500 mb-6">Select the type of ID you want to verify with</p>

              {/* Doc type cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {DOC_OPTIONS.map(doc => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setDocType(doc.id)}
                    className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                      docType === doc.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`mb-2 ${docType === doc.id ? 'text-primary-600' : 'text-gray-400'}`}>{doc.icon}</div>
                    <p className={`font-semibold text-sm ${docType === doc.id ? 'text-primary-700' : 'text-gray-800'}`}>{doc.label}</p>
                    <p className="text-xs text-gray-500">{doc.description}</p>
                  </button>
                ))}
              </div>

              {/* Document number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{DOC_LABELS[docType]}</label>
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value.toUpperCase())}
                  className="input-field w-full"
                  placeholder={selectedDoc.placeholder}
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={!docNumber.trim()}
                  onClick={goNext}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              <h2 className="text-xl font-semibold mb-1">Personal Information</h2>
              <p className="text-sm text-gray-500 mb-6">This should match your document exactly</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 input-field w-full"
                      placeholder="As on your document"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="pl-10 input-field w-full"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10 input-field w-full min-h-[80px] resize-none"
                      placeholder="Your current address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 input-field w-full"
                      placeholder="you@example.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Used for order tracking if you&apos;re a guest</p>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button type="button" onClick={goBack} className="btn-secondary">
                  Back
                </button>
                <button
                  type="button"
                  disabled={!fullName.trim() || !dob || !email.trim()}
                  onClick={goNext}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              <h2 className="text-xl font-semibold mb-1">Review & Submit</h2>
              <p className="text-sm text-gray-500 mb-6">Please verify all details before submitting</p>

              <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200 mb-6">
                {[
                  { label: 'Document Type', value: selectedDoc.label },
                  { label: DOC_LABELS[docType], value: docNumber },
                  { label: 'Full Name', value: fullName },
                  { label: 'Date of Birth', value: dob ? new Date(dob).toLocaleDateString('en-IN') : '—' },
                  { label: 'Address', value: address || '—' },
                  { label: 'Email', value: email },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-gray-500 font-medium">{label}</span>
                    <span className="text-gray-900 text-right max-w-[55%]">{value}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mb-6">
                By submitting, you confirm that the information above is accurate and matches your government-issued ID.
              </p>

              <div className="flex justify-between">
                <button type="button" onClick={goBack} className="btn-secondary">
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    'Submit KYC'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
