import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import { EXPENSE_CATEGORIES, DEPARTMENTS, formatCurrency } from '../utils/constants';
import { Topbar } from '../components/UI';
import { Save, Send, Upload, X, Image, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function SignatureUpload({ label, value, onChange, required, disabled, id }) {
  const [preview, setPreview] = useState(value || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) { toast.error('Only image files are allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File size must be under 5MB'); return; }
    setPreview(URL.createObjectURL(file));
    onChange(file);
  }, [onChange]);

  return (
    <div>
      <div
        className={`file-upload-area ${isDragging ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); if (!disabled) handleFile(e.dataTransfer.files[0]); }}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        {!disabled && (
          <input
            id={id}
            type="file"
            accept="image/*"
            onChange={e => handleFile(e.target.files[0])}
            disabled={disabled}
          />
        )}
        <div className="file-upload-icon">
          <Image size={24} />
        </div>
        {preview ? (
          <div className="file-preview">
            <img src={preview} alt="Signature preview" />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
              ✓ Signature uploaded
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {disabled ? 'Upload not available' : `Upload ${label}`}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {disabled ? '' : 'Drag & drop or click to browse · PNG, JPG, GIF up to 5MB'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function VoucherFormPage({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [signature, setSignature] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState('draft');

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    defaultValues: async () => {
      if (isEdit && id) {
        try {
          const res = await api.get(`/vouchers/${id}`);
          return res.data.data;
        } catch { return {}; }
      }
      return {
        voucher_date: new Date().toISOString().split('T')[0],
        expense_date: new Date().toISOString().split('T')[0],
      };
    },
  });

  const amount = watch('amount');

  const onSubmit = async (data) => {
    if (submitAction === 'submit' && !signature) {
      toast.error('Employee signature is required before submission');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') formData.append(key, val);
      });
      formData.append('action', submitAction);
      if (signature) formData.append('employee_signature', signature);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (isEdit) {
        await api.put(`/vouchers/${id}`, formData, config);
      } else {
        await api.post('/vouchers', formData, config);
      }

      toast.success(submitAction === 'submit' ? 'Voucher submitted for approval!' : 'Voucher saved as draft');
      navigate('/vouchers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save voucher');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar title={isEdit ? 'Edit Voucher' : 'Create New Voucher'} subtitle={isEdit ? 'Modify your draft voucher' : 'Submit a new expense reimbursement'} />
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-content">
            <h1>{isEdit ? 'Edit Voucher' : 'New Expense Voucher'}</h1>
            <p>Fill in the details below. All fields marked with * are required.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Basic Information */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div className="card-title">📋 Basic Information</div>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="voucher-date">
                    Voucher Date <span className="required">*</span>
                  </label>
                  <input
                    id="voucher-date"
                    type="date"
                    className="form-input"
                    {...register('voucher_date', { required: 'Voucher date is required' })}
                  />
                  {errors.voucher_date && <span className="form-error">{errors.voucher_date.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="expense-date">
                    Expense Date <span className="required">*</span>
                  </label>
                  <input
                    id="expense-date"
                    type="date"
                    className="form-input"
                    {...register('expense_date', { required: 'Expense date is required' })}
                  />
                  {errors.expense_date && <span className="form-error">{errors.expense_date.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="department">
                    Department <span className="required">*</span>
                  </label>
                  <select
                    id="department"
                    className="form-select"
                    {...register('department', { required: 'Department is required' })}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <span className="form-error">{errors.department.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="expense-category">
                    Expense Category <span className="required">*</span>
                  </label>
                  <select
                    id="expense-category"
                    className="form-select"
                    {...register('expense_category', { required: 'Category is required' })}
                  >
                    <option value="">Select Category</option>
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.expense_category && <span className="form-error">{errors.expense_category.message}</span>}
                </div>

                <div className="form-group full-width">
                  <label className="form-label" htmlFor="expense-title">
                    Expense Title <span className="required">*</span>
                  </label>
                  <input
                    id="expense-title"
                    type="text"
                    className="form-input"
                    placeholder="Brief title for this expense"
                    {...register('expense_title', {
                      required: 'Expense title is required',
                      minLength: { value: 3, message: 'Title must be at least 3 characters' }
                    })}
                  />
                  {errors.expense_title && <span className="form-error">{errors.expense_title.message}</span>}
                </div>

                <div className="form-group full-width">
                  <label className="form-label" htmlFor="expense-description">Description</label>
                  <textarea
                    id="expense-description"
                    className="form-textarea"
                    placeholder="Detailed description of the expense..."
                    rows={3}
                    {...register('expense_description')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="amount">
                    Amount (₹) <span className="required">*</span>
                  </label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-input"
                    placeholder="0.00"
                    {...register('amount', {
                      required: 'Amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than zero' },
                    })}
                  />
                  {errors.amount && <span className="form-error">{errors.amount.message}</span>}
                  {amount > 0 && (
                    <span className="form-hint" style={{ color: 'var(--primary-400)', fontWeight: 600 }}>
                      {formatCurrency(amount)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Employee Information */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div className="card-title">👤 Employee Information</div>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="employee-name">
                    Employee Name <span className="required">*</span>
                  </label>
                  <input
                    id="employee-name"
                    type="text"
                    className="form-input"
                    {...register('employee_name', { required: 'Employee name is required' })}
                  />
                  {errors.employee_name && <span className="form-error">{errors.employee_name.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="employee-code">Employee ID (Optional)</label>
                  <input
                    id="employee-code"
                    type="text"
                    className="form-input"
                    placeholder="e.g. EMP001"
                    {...register('employee_code')}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label" htmlFor="employee-signature">
                    Employee Signature <span className="required">* (required for submission)</span>
                  </label>
                  <SignatureUpload
                    id="employee-signature"
                    label="Employee Signature"
                    value={null}
                    onChange={setSignature}
                    required
                  />
                  {!signature && submitAction === 'submit' && (
                    <span className="form-error">
                      <AlertCircle size={14} /> Signature is required to submit
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              id="save-draft-btn"
              type="submit"
              className="btn btn-secondary"
              disabled={submitting}
              onClick={() => setSubmitAction('draft')}
            >
              {submitting && submitAction === 'draft' ? <div className="loading-spinner" /> : <Save size={16} />}
              Save as Draft
            </button>
            <button
              id="submit-voucher-btn"
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              onClick={() => setSubmitAction('submit')}
            >
              {submitting && submitAction === 'submit' ? <div className="loading-spinner" /> : <Send size={16} />}
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
