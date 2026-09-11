import { Component, lazy, Suspense, useState, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Button, Result } from 'antd';
import { ThemeProvider } from './theme/ThemeProvider';
import { WorkspaceProvider } from './data/WorkspaceProvider';
import { PageSkeleton } from './components/feedback';
const Shell = lazy(() => import('./components/shell/AppShell'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const Notifications = lazy(() => import('./pages/system/Notifications'));
const AuditLog = lazy(() => import('./pages/system/AuditLog'));
const Profile = lazy(() => import('./pages/system/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Products = lazy(() => import('./pages/inventory/Products'));
const StockLevels = lazy(() => import('./pages/inventory/StockLevels'));
const Warehouses = lazy(() => import('./pages/inventory/Warehouses'));
const StockTransfers = lazy(() => import('./pages/inventory/StockTransfers'));
const PurchaseOrders = lazy(() => import('./pages/inventory/PurchaseOrders'));
const Suppliers = lazy(() => import('./pages/inventory/Suppliers'));
const Accounts = lazy(() => import('./pages/accounting/Accounts'));
const Journals = lazy(() => import('./pages/accounting/Journals'));
const Invoices = lazy(() => import('./pages/accounting/Invoices'));
const Payments = lazy(() => import('./pages/accounting/Payments'));
const Expenses = lazy(() => import('./pages/accounting/Expenses'));
const Customers = lazy(() => import('./pages/accounting/Customers'));
const Users = lazy(() => import('./pages/system/Users'));
class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <Result
        status="error"
        title="This view couldn’t load"
        subTitle="Reload to try again. Your saved browser data will be preserved."
        extra={<Button onClick={() => location.reload()}>Reload workspace</Button>}
      />
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const [authenticated, setAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('aster:demo-session') === 'active';
    } catch {
      return false;
    }
  });
  const login = () => {
    try {
      sessionStorage.setItem('aster:demo-session', 'active');
    } catch {
      /* session-only fallback */
    }
    setAuthenticated(true);
  };
  const logout = () => {
    try {
      sessionStorage.removeItem('aster:demo-session');
    } catch {
      /* session-only fallback */
    }
    setAuthenticated(false);
  };
  return (
    <ThemeProvider userId="demo-user">
      <ErrorBoundary>
        <WorkspaceProvider>
          <HashRouter>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route
                  path="/login"
                  element={
                    authenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={login} />
                  }
                />
                <Route
                  element={
                    authenticated ? <Shell onLogout={logout} /> : <Navigate to="/login" replace />
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="system/notifications" element={<Notifications />} />
                  <Route path="system/audit-log" element={<AuditLog />} />
                  <Route path="system/users" element={<Users />} />
                  <Route path="inventory/products" element={<Products />} />
                  <Route path="inventory/stock-levels" element={<StockLevels />} />
                  <Route path="inventory/warehouses" element={<Warehouses />} />
                  <Route path="inventory/stock-transfers" element={<StockTransfers />} />
                  <Route path="inventory/purchase-orders" element={<PurchaseOrders />} />
                  <Route path="inventory/suppliers" element={<Suppliers />} />
                  <Route path="accounting/chart-of-accounts" element={<Accounts />} />
                  <Route path="accounting/journal-entries" element={<Journals />} />
                  <Route path="accounting/sales-invoices" element={<Invoices />} />
                  <Route path="accounting/payments" element={<Payments />} />
                  <Route path="accounting/expenses" element={<Expenses />} />
                  <Route path="accounting/customers" element={<Customers />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </HashRouter>
        </WorkspaceProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
