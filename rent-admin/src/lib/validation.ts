export type FormErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;

export const validators = {
  required: (value: string, label = 'This field') =>
    !value?.toString().trim() ? `${label} is required` : '',

  email: (value: string) => {
    if (!value.trim()) return 'Email is required';
    return EMAIL_RE.test(value) ? '' : 'Enter a valid email address';
  },

  phone: (value: string) => {
    if (!value.trim()) return 'Phone number is required';
    return PHONE_RE.test(value.replace(/\s/g, ''))
      ? ''
      : 'Enter a valid 10-digit mobile number';
  },

  password: (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
    return '';
  },

  adminPassword: (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  },

  confirmPassword: (value: string, original: string) => {
    if (!value) return 'Please confirm your password';
    return value === original ? '' : 'Passwords do not match';
  },

  minLength: (value: string, min: number, label = 'This field') => {
    if (!value?.trim()) return `${label} is required`;
    return value.trim().length >= min ? '' : `${label} must be at least ${min} characters`;
  },

  positiveNumber: (value: string | number, label = 'Value') => {
    const n = Number(value);
    if (value === '' || value === null || value === undefined) return `${label} is required`;
    if (isNaN(n)) return `${label} must be a number`;
    return n > 0 ? '' : `${label} must be greater than 0`;
  },

  nonNegativeNumber: (value: string | number, label = 'Value') => {
    const n = Number(value);
    if (value === '' || value === null || value === undefined) return `${label} is required`;
    if (isNaN(n)) return `${label} must be a number`;
    return n >= 0 ? '' : `${label} cannot be negative`;
  },
};


export function clearError(errors: FormErrors, field: string): FormErrors {
  if (!errors[field]) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
