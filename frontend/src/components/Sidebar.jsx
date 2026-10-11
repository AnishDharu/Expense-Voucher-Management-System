import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials, getRoleBadgeColor } from '../utils/constants';
import {
  LayoutDashboard, FileText, FilePlus, Clock, CheckCircle, XCircle,
  Users, LogOut, Receipt, ChevronRight, Banknote, FileSearch
} from 'lucide-react';

const employeeNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vouchers/new', label: 'New Voucher', icon: FilePlus },
  { to: '/vouchers', label: 'My Vouchers', icon: FileText },
];

const directorNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pending', label: 'Pending Approvals', icon: Clock },
  { to: '/vouchers', label: 'All Vouchers', icon: FileSearch },
];

const accountsNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vouchers', label: 'All Vouchers', icon: FileSearch },
];

const navMap = { employee: employeeNav, director: directorNav, accounts: accountsNav };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navMap[user?.role] || [];
  const roleColors = getRoleBadgeColor(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Receipt size={22} color="white" />
        </div>
        <div>
          <div className="brand-name">ExpenseFlow</div>
          <div className="brand-tagline">Voucher Management</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info & logout */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div style={{ overflow: 'hidden' }}>
            <div className="user-name">{user?.name}</div>
            <div className="user-role" style={{ color: roleColors.color }}>{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-ghost w-full" onClick={handleLogout} id="logout-btn">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
