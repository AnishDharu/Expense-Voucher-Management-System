import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Receipt, Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { email: 'employee@abc.com', role: 'Employee', desc: 'Create & submit vouchers' },
  { email: 'director@abc.com', role: 'Director', desc: 'Approve & reject vouchers' },
  { email: 'accounts@abc.com', role: 'Accounts', desc: 'Monitor all vouchers' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrors({});
  };

  return (
    <div className="login-page">
      <div className="login-bg-decoration" />
      <div className="login-container">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">
              <Receipt size={32} color="white" />
            </div>
            <div className="login-title">ExpenseFlow</div>
            <div className="login-subtitle">Expense Voucher Management System</div>
            <div className="login-subtitle" style={{ marginTop: 4, fontSize: '0.78rem' }}>ABC Company</div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="login-email">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@abc.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" htmlFor="login-password">
                Password <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary w-full btn-lg"
              disabled={loading}
            >
              {loading ? <div className="loading-spinner" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="demo-accounts" style={{ marginTop: 24 }}>
            <h4><Zap size={12} style={{ display: 'inline', marginRight: 4 }} />Quick Demo Login</h4>
            {DEMO_ACCOUNTS.map((acc) => {
              const roleColors = {
                Employee: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
                Director: { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' },
                Accounts: { bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
              }[acc.role];
              return (
                <div
                  key={acc.email}
                  className="demo-account-item"
                  onClick={() => fillDemo(acc.email)}
                  title={`Click to fill: ${acc.email} / password123`}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{acc.email}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{acc.desc}</div>
                  </div>
                  <span
                    className="role-badge"
                    style={{ background: roleColors.bg, color: roleColors.color, border: `1px solid ${roleColors.color}40` }}
                  >
                    {acc.role}
                  </span>
                </div>
              );
            })}
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
              All demo accounts use password: <strong style={{ color: 'var(--text-secondary)' }}>password123</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
