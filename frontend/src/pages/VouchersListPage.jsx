import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { formatCurrency, formatDate, STATUS_OPTIONS, DEPARTMENTS, EXPENSE_CATEGORIES } from '../utils/constants';
import { StatusBadge, LoadingPage, EmptyState, Topbar } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import {
  Search, Filter, ArrowUpDown, ChevronRight, FileText, ChevronUp, ChevronDown,
  X, SlidersHorizontal, FilePlus
} from 'lucide-react';

function SortIcon({ field, sortBy, sortDir }) {
  if (sortBy !== field) return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
  return sortDir === 'ASC' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
}

export default function VouchersListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    department: '',
    expense_category: '',
    date_from: '',
    date_to: '',
    amount_min: '',
    amount_max: '',
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('DESC');
  const [page, setPage] = useState(1);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, sort_by: sortBy, sort_dir: sortDir, page, limit: 15 };
      // Remove empty filters
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/vouchers', { params });
      setVouchers(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortDir, page]);

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setSortDir('DESC'); }
    setPage(1);
  };

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', department: '', expense_category: '', date_from: '', date_to: '', amount_min: '', amount_max: '' });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');
  const isEmployee = user?.role === 'employee';

  return (
    <>
      <Topbar
        title={isEmployee ? 'My Vouchers' : 'All Vouchers'}
        subtitle={`${pagination.total || 0} vouchers`}
      />
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-content">
            <h1>{isEmployee ? 'My Vouchers' : 'All Vouchers'}</h1>
            <p>{isEmployee ? 'Track your submitted expense vouchers' : 'View and manage all expense vouchers across the organization'}</p>
          </div>
          {isEmployee && (
            <div className="page-header-actions">
              <Link to="/vouchers/new" className="btn btn-primary" id="create-voucher-cta">
                <FilePlus size={16} /> New Voucher
              </Link>
            </div>
          )}
        </div>

        <div className="card">
          {/* Search & Filter Bar */}
          <div className="filter-bar">
            <div className="search-input-wrap">
              <Search size={16} />
              <input
                id="voucher-search"
                type="text"
                className="form-input"
                placeholder="Search by voucher #, employee, department..."
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
              />
            </div>

            <select
              id="status-filter"
              className="form-select filter-select"
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <button
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowFilters(!showFilters)}
              id="toggle-filters-btn"
            >
              <SlidersHorizontal size={16} /> {showFilters ? 'Hide' : 'More'} Filters
            </button>

            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div style={{ padding: '16px 24px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-select" value={filters.department} onChange={e => handleFilterChange('department', e.target.value)}>
                    <option value="">All Departments</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={filters.expense_category} onChange={e => handleFilterChange('expense_category', e.target.value)}>
                    <option value="">All Categories</option>
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date From</label>
                  <input type="date" className="form-input" value={filters.date_from} onChange={e => handleFilterChange('date_from', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date To</label>
                  <input type="date" className="form-input" value={filters.date_to} onChange={e => handleFilterChange('date_to', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Amount (₹)</label>
                  <input type="number" className="form-input" placeholder="0" value={filters.amount_min} onChange={e => handleFilterChange('amount_min', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Amount (₹)</label>
                  <input type="number" className="form-input" placeholder="999999" value={filters.amount_max} onChange={e => handleFilterChange('amount_max', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <LoadingPage />
          ) : vouchers.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No vouchers found"
              description={hasActiveFilters ? "Try adjusting your filters" : isEmployee ? "Create your first expense voucher" : "No vouchers in the system yet"}
              action={isEmployee && !hasActiveFilters ? <Link to="/vouchers/new" className="btn btn-primary"><FilePlus size={16} /> New Voucher</Link> : null}
            />
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('voucher_number')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        Voucher # <SortIcon field="voucher_number" sortBy={sortBy} sortDir={sortDir} />
                      </span>
                    </th>
                    {!isEmployee && <th className="sortable" onClick={() => handleSort('employee_name')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Employee <SortIcon field="employee_name" sortBy={sortBy} sortDir={sortDir} /></span>
                    </th>}
                    <th className="sortable" onClick={() => handleSort('department')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Dept <SortIcon field="department" sortBy={sortBy} sortDir={sortDir} /></span>
                    </th>
                    <th>Title</th>
                    <th>Category</th>
                    <th className="sortable" onClick={() => handleSort('amount')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Amount <SortIcon field="amount" sortBy={sortBy} sortDir={sortDir} /></span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('expense_date')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Date <SortIcon field="expense_date" sortBy={sortBy} sortDir={sortDir} /></span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('status')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Status <SortIcon field="status" sortBy={sortBy} sortDir={sortDir} /></span>
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map(v => (
                    <tr key={v.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-400)', fontSize: '0.8rem' }}>{v.voucher_number}</td>
                      {!isEmployee && <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v.employee_name}</td>}
                      <td>
                        <span style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem' }}>{v.department}</span>
                      </td>
                      <td style={{ color: 'var(--text-primary)', maxWidth: 200 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.expense_title}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{v.expense_category}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(v.amount)}</td>
                      <td>{formatDate(v.expense_date)}</td>
                      <td><StatusBadge status={v.status} /></td>
                      <td>
                        <Link to={`/vouchers/${v.id}`} className="btn btn-ghost btn-sm" id={`view-voucher-${v.id}`}>
                          View <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {((page - 1) * 15) + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total} vouchers
              </div>
              <div className="pagination-controls">
                <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
