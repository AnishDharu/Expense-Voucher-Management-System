import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VouchersListPage from './pages/VouchersListPage';
import VoucherFormPage from './pages/VoucherFormPage';
import VoucherDetailPage from './pages/VoucherDetailPage';
import PendingApprovalsPage from './pages/PendingApprovalsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2540',
              color: '#f0f4ff',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0a0e1a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0e1a' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Employee Routes */}
          <Route element={<ProtectedLayout allowedRoles={['employee']} />}>
            <Route path="/vouchers/new" element={<VoucherFormPage isEdit={false} />} />
            <Route path="/vouchers/:id/edit" element={<VoucherFormPage isEdit={true} />} />
          </Route>

          {/* Director Routes */}
          <Route element={<ProtectedLayout allowedRoles={['director']} />}>
            <Route path="/pending" element={<PendingApprovalsPage />} />
          </Route>

          {/* Shared Protected Routes */}
          <Route element={<ProtectedLayout allowedRoles={['employee', 'director', 'accounts']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vouchers" element={<VouchersListPage />} />
            <Route path="/vouchers/:id" element={<VoucherDetailPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
