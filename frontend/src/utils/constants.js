export const EXPENSE_CATEGORIES = [
  'Travel & Transportation',
  'Accommodation',
  'Meals & Entertainment',
  'Office Supplies',
  'Software & Subscriptions',
  'Training & Education',
  'Medical',
  'Client Relations',
  'Utilities',
  'Equipment',
  'Other',
];

export const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Operations',
  'Management',
  'Legal',
  'Customer Support',
  'Design',
  'Research & Development',
  'Administration',
];

export const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return dateStr; }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return dateStr; }
};

export const getStatusClass = (status) => {
  const map = {
    draft: 'badge-draft',
    submitted: 'badge-submitted',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  };
  return map[status] || 'badge-draft';
};

export const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getRoleBadgeColor = (role) => {
  const map = {
    employee: { bg: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
    director: { bg: 'rgba(139, 92, 246, 0.12)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
    accounts: { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
  };
  return map[role] || map.employee;
};
