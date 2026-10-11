import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { formatCurrency, formatDate, formatDateTime } from '../utils/constants';
import { StatusBadge, WorkflowStatus, LoadingPage, Topbar } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Printer,
  Upload, AlertCircle, Calendar, Building, User, Tag, FileText, DollarSign, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Approve Modal ──────────────────────────────────────────────────────────
function ApproveModal({ onClose, onApprove }) {
  const [sig, setSig] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    setSig(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleApprove = async () => {
    if (!sig) { toast.error('Director signature is required for approval'); return; }
    setLoading(true);
    await onApprove(sig);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={20} color="#10b981" /> Approve Voucher
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><XCircle size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            <AlertCircle size={18} />
            <div>You are about to approve this expense voucher. Your signature is required.</div>
          </div>
          <div className="form-group">
            <label className="form-label">Director Signature <span className="required">*</span></label>
            <div className="file-upload-area" style={{ padding: 24, textAlign: 'center' }}>
              <input type="file" accept="image/*" id="director-sig-upload" onChange={e => handleFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
              {preview ? (
                <div>
                  <img src={preview} alt="Signature" style={{ maxWidth: 200, maxHeight: 80, objectFit: 'contain', background: 'white', borderRadius: 8, padding: 8 }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8 }}>✓ Signature ready</p>
                </div>
              ) : (
                <>
                  <Upload size={24} style={{ color: 'var(--primary-400)', marginBottom: 8 }} />
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Click or drag to upload your signature</p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button id="confirm-approve-btn" className="btn btn-success" onClick={handleApprove} disabled={loading || !sig}>
            {loading ? <div className="loading-spinner" /> : <CheckCircle size={16} />}
            Confirm Approval
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reject Modal ──────────────────────────────────────────────────────────
function RejectModal({ onClose, onReject }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) { toast.error('Rejection reason is required'); return; }
    setLoading(true);
    await onReject(reason);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <XCircle size={20} color="#ef4444" /> Reject Voucher
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><XCircle size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="alert alert-warning" style={{ marginBottom: 20 }}>
            <AlertCircle size={18} />
            <div>Please provide a clear reason for rejection. The employee will be able to see this.</div>
          </div>
          <div className="form-group">
            <label className="form-label">Rejection Reason <span className="required">*</span></label>
            <textarea
              id="rejection-reason-input"
              className="form-textarea"
              rows={4}
              placeholder="Explain why this voucher is being rejected..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button id="confirm-reject-btn" className="btn btn-danger" onClick={handleReject} disabled={loading || !reason.trim()}>
            {loading ? <div className="loading-spinner" /> : <XCircle size={16} />}
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ───────────────────────────────────────────────────
function DeleteModal({ onClose, onDelete }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title" style={{ color: '#ef4444' }}>Delete Voucher</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><XCircle size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <div>This action <strong>cannot be undone</strong>. This voucher will be permanently deleted.</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button id="confirm-delete-btn" className="btn btn-danger" disabled={loading} onClick={async () => { setLoading(true); await onDelete(); setLoading(false); }}>
            {loading ? <div className="loading-spinner" /> : <Trash2 size={16} />}
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Voucher Detail Page ────────────────────────────────────────────────────
export default function VoucherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'approve' | 'reject' | 'delete'

  useEffect(() => {
    api.get(`/vouchers/${id}`)
      .then(r => setVoucher(r.data.data))
      .catch(() => toast.error('Voucher not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async (sig) => {
    const fd = new FormData();
    fd.append('director_signature', sig);
    try {
      const res = await api.post(`/vouchers/${id}/approve`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setVoucher(res.data.data);
      setModal(null);
      toast.success('Voucher approved successfully! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (reason) => {
    try {
      const res = await api.post(`/vouchers/${id}/reject`, { rejection_reason: reason });
      setVoucher(res.data.data);
      setModal(null);
      toast.success('Voucher rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/vouchers/${id}`);
      toast.success('Voucher deleted');
      navigate('/vouchers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handlePrint = () => window.print();

  if (loading) return <><Topbar title="Voucher Detail" /><LoadingPage /></>;
  if (!voucher) return null;

  const isEmployee = user?.role === 'employee';
  const isDirector = user?.role === 'director';
  const canEdit = isEmployee && voucher.status === 'draft';
  const canDelete = isEmployee && voucher.status === 'draft';
  const canApproveReject = isDirector && voucher.status === 'submitted';

  return (
    <>
      <Topbar title="Voucher Detail" subtitle={voucher.voucher_number} />
      {modal === 'approve' && <ApproveModal onClose={() => setModal(null)} onApprove={handleApprove} />}
      {modal === 'reject' && <RejectModal onClose={() => setModal(null)} onReject={handleReject} />}
      {modal === 'delete' && <DeleteModal onClose={() => setModal(null)} onDelete={handleDelete} />}

      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back
              </button>
              <StatusBadge status={voucher.status} />
            </div>
            <h1 style={{ fontSize: '1.5rem' }}>{voucher.expense_title}</h1>
            <p style={{ fontFamily: 'monospace', color: 'var(--primary-400)', fontWeight: 600 }}>{voucher.voucher_number}</p>
          </div>
          <div className="page-header-actions">
            {canEdit && (
              <Link to={`/vouchers/${id}/edit`} className="btn btn-secondary" id="edit-voucher-btn">
                <Edit size={16} /> Edit
              </Link>
            )}
            {canDelete && (
              <button className="btn btn-danger" onClick={() => setModal('delete')} id="delete-voucher-btn">
                <Trash2 size={16} /> Delete
              </button>
            )}
            {canApproveReject && (
              <>
                <button className="btn btn-success" onClick={() => setModal('approve')} id="approve-voucher-btn">
                  <CheckCircle size={16} /> Approve
                </button>
                <button className="btn btn-danger" onClick={() => setModal('reject')} id="reject-voucher-btn">
                  <XCircle size={16} /> Reject
                </button>
              </>
            )}
            <button className="btn btn-secondary" onClick={handlePrint} id="print-voucher-btn">
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Workflow Status */}
        <div className="card" style={{ marginBottom: 24, padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Approval Workflow</div>
              <WorkflowStatus status={voucher.status} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {formatCurrency(voucher.amount)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</div>
            </div>
          </div>
        </div>

        {/* Rejection Notice */}
        {voucher.status === 'rejected' && voucher.rejection_reason && (
          <div className="alert alert-danger" style={{ marginBottom: 24 }}>
            <XCircle size={18} />
            <div>
              <strong>Rejection Reason:</strong>
              <p style={{ marginTop: 4 }}>{voucher.rejection_reason}</p>
            </div>
          </div>
        )}

        <div className="voucher-detail-grid">
          {/* Left Column */}
          <div>
            {/* Basic Info */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div className="card-title"><FileText size={18} /> Expense Details</div>
              </div>
              <div className="card-body">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label"><Calendar size={12} /> Voucher Date</span>
                    <span className="value">{formatDate(voucher.voucher_date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label"><Calendar size={12} /> Expense Date</span>
                    <span className="value">{formatDate(voucher.expense_date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label"><Building size={12} /> Department</span>
                    <span className="value">{voucher.department}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label"><Tag size={12} /> Category</span>
                    <span className="value">{voucher.expense_category}</span>
                  </div>
                  <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="label">Title</span>
                    <span className="value" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{voucher.expense_title}</span>
                  </div>
                  {voucher.expense_description && (
                    <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="label">Description</span>
                      <span className="value" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{voucher.expense_description}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label"><DollarSign size={12} /> Amount</span>
                    <span className="value amount">{formatCurrency(voucher.amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Info */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><User size={18} /> Employee Information</div>
              </div>
              <div className="card-body">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Employee Name</span>
                    <span className="value">{voucher.employee_name}</span>
                  </div>
                  {voucher.employee_code && (
                    <div className="detail-item">
                      <span className="label">Employee ID</span>
                      <span className="value" style={{ fontFamily: 'monospace' }}>{voucher.employee_code}</span>
                    </div>
                  )}
                  {voucher.employee_email && (
                    <div className="detail-item">
                      <span className="label">Email</span>
                      <span className="value">{voucher.employee_email}</span>
                    </div>
                  )}
                </div>

                {voucher.employee_signature && (
                  <div style={{ marginTop: 20 }}>
                    <div className="detail-section-title"><Upload size={14} /> Employee Signature</div>
                    <div className="signature-display">
                      <img src={`/${voucher.employee_signature}`} alt="Employee signature" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Approval Info */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div className="card-title"><CheckCircle size={18} /> Approval Status</div>
              </div>
              <div className="card-body">
                <div className="detail-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="detail-item">
                    <span className="label">Current Status</span>
                    <span className="value"><StatusBadge status={voucher.status} /></span>
                  </div>
                  {voucher.director_name && (
                    <div className="detail-item">
                      <span className="label">Reviewed By</span>
                      <span className="value">{voucher.director_name}</span>
                    </div>
                  )}
                  {voucher.approval_date && (
                    <div className="detail-item">
                      <span className="label">Approval Date</span>
                      <span className="value">{formatDate(voucher.approval_date)}</span>
                    </div>
                  )}
                  {voucher.rejection_reason && (
                    <div className="detail-item">
                      <span className="label" style={{ color: '#ef4444' }}>Rejection Reason</span>
                      <span className="value" style={{ color: '#fca5a5' }}>{voucher.rejection_reason}</span>
                    </div>
                  )}
                </div>

                {voucher.director_signature && (
                  <div style={{ marginTop: 16 }}>
                    <div className="detail-section-title"><Upload size={14} /> Director Signature</div>
                    <div className="signature-display">
                      <img src={`/${voucher.director_signature}`} alt="Director signature" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Info */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><Clock size={18} /> Audit Trail</div>
              </div>
              <div className="card-body">
                <div className="detail-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="detail-item">
                    <span className="label">Created At</span>
                    <span className="value" style={{ fontSize: '0.8rem' }}>{formatDateTime(voucher.created_at)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Last Updated</span>
                    <span className="value" style={{ fontSize: '0.8rem' }}>{formatDateTime(voucher.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
