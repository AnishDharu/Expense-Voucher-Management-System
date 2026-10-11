import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusClass } from '../utils/constants';
import { LoadingPage, StatusBadge, Topbar } from '../components/UI';
import {
  FileText, FilePlus, Clock, CheckCircle, XCircle, DollarSign,
  TrendingUp, AlertCircle, Users, ChevronRight, Wallet, Activity
} from 'lucide-react';

// ─── Employee Dashboard ───────────────────────────────────────────────────────
function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/dashboard/employee').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;
  const { stats, recentVouchers } = data || {};

  const statCards = [
    { label: 'Total Vouchers', value: stats?.total || 0, icon: FileText, cls: 'stat-blue' },
    { label: 'Drafts', value: stats?.draft || 0, icon: FilePlus, cls: 'stat-purple' },
    { label: 'Pending Approval', value: stats?.submitted || 0, icon: Clock, cls: 'stat-yellow' },
    { label: 'Approved', value: stats?.approved || 0, icon: CheckCircle, cls: 'stat-green' },
    { label: 'Rejected', value: stats?.rejected || 0, icon: XCircle, cls: 'stat-red' },
    { label: 'Total Claimed', value: formatCurrency(stats?.total_amount_claimed), icon: Wallet, cls: 'stat-cyan' },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Here's an overview of your expense vouchers</p>
        </div>
        <div className="page-header-actions">
          <Link to="/vouchers/new" className="btn btn-primary" id="new-voucher-btn">
            <FilePlus size={16} />
            New Voucher
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((c) => (
          <div key={c.label} className={`stat-card ${c.cls}`}>
            <div className="stat-icon"><c.icon size={22} /></div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><Activity size={18} /> Recent Vouchers</div>
          <Link to="/vouchers" className="btn btn-ghost btn-sm">View All <ChevronRight size={14} /></Link>
        </div>
        {recentVouchers?.length > 0 ? (
          <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentVouchers.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-400)' }}>{v.voucher_number}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v.expense_title}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(v.amount)}</td>
                    <td>{formatDate(v.expense_date)}</td>
                    <td><StatusBadge status={v.status} /></td>
                    <td>
                      <Link to={`/vouchers/${v.id}`} className="btn btn-ghost btn-sm">
                        View <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-empty">
            <FileText />
            <p style={{ fontWeight: 600 }}>No vouchers yet</p>
            <p>Create your first expense voucher to get started</p>
            <Link to="/vouchers/new" className="btn btn-primary" style={{ marginTop: 16 }}>
              <FilePlus size={16} /> Create Voucher
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Director Dashboard ───────────────────────────────────────────────────────
function DirectorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/dashboard/director').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;
  const { stats, recentActivity, pendingVouchers } = data || {};

  const statCards = [
    { label: 'Pending Approval', value: stats?.pending_approval || 0, icon: Clock, cls: 'stat-yellow' },
    { label: 'Approved Today', value: stats?.approved_today || 0, icon: CheckCircle, cls: 'stat-green' },
    { label: 'Rejected Today', value: stats?.rejected_today || 0, icon: XCircle, cls: 'stat-red' },
    { label: 'Total Pending Amount', value: formatCurrency(stats?.total_pending_amount), icon: DollarSign, cls: 'stat-blue' },
    { label: 'Total Vouchers', value: stats?.total_vouchers || 0, icon: FileText, cls: 'stat-purple' },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Director Dashboard</h1>
          <p>Manage and approve expense vouchers across the organization</p>
        </div>
        {stats?.pending_approval > 0 && (
          <div className="page-header-actions">
            <Link to="/pending" className="btn btn-primary" id="view-pending-btn">
              <Clock size={16} />
              {stats.pending_approval} Pending
            </Link>
          </div>
        )}
      </div>

      <div className="stats-grid">
        {statCards.map(c => (
          <div key={c.label} className={`stat-card ${c.cls}`}>
            <div className="stat-icon"><c.icon size={22} /></div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Pending Vouchers */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><AlertCircle size={18} color="#fbbf24" /> Awaiting Approval</div>
            <Link to="/pending" className="btn btn-ghost btn-sm">View All <ChevronRight size={14} /></Link>
          </div>
          {pendingVouchers?.length > 0 ? (
            <div style={{ padding: '0 8px 8px' }}>
              {pendingVouchers.map(v => (
                <Link key={v.id} to={`/vouchers/${v.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '12px 16px', borderRadius: 10, margin: '4px 0',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                    transition: 'all 0.2s', cursor: 'pointer',
                  }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-400)', fontFamily: 'monospace' }}>{v.voucher_number}</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{v.expense_title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{v.employee_name} · {v.department}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24' }}>{formatCurrency(v.amount)}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(v.expense_date)}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="table-empty">
              <CheckCircle style={{ color: '#10b981' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>All caught up!</p>
              <p>No vouchers awaiting approval</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Activity size={18} /> Recent Activity</div>
            <Link to="/vouchers" className="btn btn-ghost btn-sm">All Vouchers <ChevronRight size={14} /></Link>
          </div>
          {recentActivity?.length > 0 ? (
            <div style={{ padding: '0 8px 8px' }}>
              {recentActivity.slice(0, 6).map(v => (
                <Link key={v.id} to={`/vouchers/${v.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 16px', borderRadius: 8, margin: '2px 0',
                    transition: 'background 0.15s', cursor: 'pointer',
                  }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <StatusBadge status={v.status} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.expense_title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{v.employee_name}</div>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>{formatCurrency(v.amount)}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="table-empty"><Activity /><p>No recent activity</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Accounts Dashboard ───────────────────────────────────────────────────────
function AccountsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/accounts').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;
  const { stats, recentApproved } = data || {};

  const statCards = [
    { label: 'Total Vouchers', value: stats?.total || 0, icon: FileText, cls: 'stat-blue' },
    { label: 'Pending Approval', value: stats?.pending_approval || 0, icon: Clock, cls: 'stat-yellow' },
    { label: 'Approved', value: stats?.approved || 0, icon: CheckCircle, cls: 'stat-green' },
    { label: 'Rejected', value: stats?.rejected || 0, icon: XCircle, cls: 'stat-red' },
    { label: 'Total Approved Amount', value: formatCurrency(stats?.total_approved_amount), icon: TrendingUp, cls: 'stat-cyan' },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Accounts Dashboard</h1>
          <p>Monitor all expense vouchers and reimbursement status</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(c => (
          <div key={c.label} className={`stat-card ${c.cls}`}>
            <div className="stat-icon"><c.icon size={22} /></div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><CheckCircle size={18} color="#10b981" /> Recent Approved Vouchers</div>
          <Link to="/vouchers?status=approved" className="btn btn-ghost btn-sm">View All <ChevronRight size={14} /></Link>
        </div>
        {recentApproved?.length > 0 ? (
          <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Approved On</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentApproved.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-400)' }}>{v.voucher_number}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{v.employee_name}</td>
                    <td>{v.department}</td>
                    <td>{v.expense_title}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(v.amount)}</td>
                    <td>{formatDate(v.approval_date)}</td>
                    <td>
                      <Link to={`/vouchers/${v.id}`} className="btn btn-ghost btn-sm">View <ChevronRight size={14} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-empty"><CheckCircle /><p>No approved vouchers yet</p></div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard Router ────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <Topbar title={
        user?.role === 'employee' ? 'My Dashboard' :
        user?.role === 'director' ? 'Director Dashboard' : 'Accounts Dashboard'
      } />
      {user?.role === 'employee' && <EmployeeDashboard />}
      {user?.role === 'director' && <DirectorDashboard />}
      {user?.role === 'accounts' && <AccountsDashboard />}
    </>
  );
}
