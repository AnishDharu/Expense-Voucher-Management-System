import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/constants';
import { StatusBadge, LoadingPage, EmptyState, Topbar } from '../components/UI';
import { Clock, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function PendingApprovalsPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vouchers', { params: { status: 'submitted', sort_by: 'created_at', sort_dir: 'ASC', limit: 50 } })
      .then(r => setVouchers(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Pending Approvals" subtitle={`${vouchers.length} awaiting review`} />
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-content">
            <h1>Pending Approvals</h1>
            <p>Review and act on submitted expense vouchers — oldest first</p>
          </div>
        </div>

        {loading ? (
          <LoadingPage />
        ) : vouchers.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={CheckCircle}
              title="All caught up!"
              description="No vouchers are currently awaiting approval."
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {vouchers.map(v => (
              <div key={v.id} className="card" style={{ transition: 'all 0.2s' }}>
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  {/* Icon */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <AlertCircle size={22} color="#fbbf24" />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-400)' }}>
                        {v.voucher_number}
                      </span>
                      <StatusBadge status={v.status} />
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {v.expense_title}
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>👤 {v.employee_name}</span>
                      <span>🏢 {v.department}</span>
                      <span>📅 {formatDate(v.expense_date)}</span>
                      <span>🏷 {v.expense_category}</span>
                    </div>
                  </div>

                  {/* Amount & Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>
                        {formatCurrency(v.amount)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Submitted {formatDate(v.created_at)}
                      </div>
                    </div>
                    <Link
                      to={`/vouchers/${v.id}`}
                      className="btn btn-primary"
                      id={`review-voucher-${v.id}`}
                    >
                      Review <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
