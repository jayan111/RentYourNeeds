export type FormErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;

export const validators = {
  required: (value: string, label = 'This field') =>
    !value.trim() ? `${label} is required` : '',

  email: (value: string) => {
    if (!value.trim()) return 'Email is required';
    return EMAIL_RE.test(value) ? '' : 'Enter a valid email address';
  },

  phone: (value: string) => {
    if (!value.trim()) return 'Phone number is required';
    return PHONE_RE.test(value.replace(/\s/g, ''))
      ? ''
      : 'Enter a valid 10-digit Indian mobile number';
  },

  password: (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
    return '';
  },

  confirmPassword: (value: string, original: string) => {
    if (!value) return 'Please confirm your password';
    return value === original ? '' : 'Passwords do not match';
  },

  minLength: (value: string, min: number, label = 'This field') => {
    if (!value.trim()) return `${label} is required`;
    return value.trim().length >= min
      ? ''
      : `${label} must be at least ${min} characters`;
  },

  maxLength: (value: string, max: number, label = 'This field') =>
    value.trim().length > max ? `${label} must be at most ${max} characters` : '',

  positiveNumber: (value: string | number, label = 'Value') => {
    const n = Number(value);
    if (isNaN(n)) return `${label} must be a number`;
    return n > 0 ? '' : `${label} must be greater than 0`;
  },

  documentNumber: (type: string, value: string) => {
    if (!value.trim()) return 'Document number is required';
    const v = value.trim().toUpperCase();
    if (type === 'aadhaar' && !/^\d{12}$/.test(v))
      return 'Aadhaar number must be exactly 12 digits';
    if (type === 'pan' && !/^[A-Z]{5}\d{4}[A-Z]$/.test(v))
      return 'PAN must be in format ABCDE1234F';
    if (type === 'driving_license' && v.length < 5)
      return 'Enter a valid driving license number';
    if (type === 'passport' && !/^[A-Z]\d{7}$/.test(v))
      return 'Passport must be in format A1234567';
    return '';
  },

  dateOfBirth: (value: string) => {
    if (!value) return 'Date of birth is required';
    const dob = new Date(value);
    const today = new Date();
    if (isNaN(dob.getTime())) return 'Enter a valid date';
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 18) return 'You must be at least 18 years old';
    if (age > 100) return 'Enter a valid date of birth';
    return '';
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
