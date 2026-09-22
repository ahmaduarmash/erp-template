import { Component, lazy, Suspense, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Button, Result } from 'antd';
import { ThemeProvider } from './theme/ThemeProvider';
import { WorkspaceProvider } from './data/WorkspaceProvider';
import { PageSkeleton } from './components/feedback';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { routeRegistry } from './config/routes';

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

function permissionFor(key: string) {
  return routeRegistry.find((route) => route.key === key)?.permission;
}

function Protected({ routeKey, children }: { routeKey: string; children: ReactNode }) {
  const auth = useAuth();
  const permission = permissionFor(routeKey);
  if (auth.can(permission)) return children;
  return (
    <Result
      status="403"
      title="Access restricted"
      subTitle="Your current role does not have permission to open this workspace."
    />
  );
}

function AppRoutes() {
  const auth = useAuth();
  return (
    <ThemeProvider userId={auth.user?.id ?? 'anonymous-demo'}>
      <ErrorBoundary>
        <WorkspaceProvider>
          <HashRouter>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route
                  path="/login"
                  element={auth.authenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={auth.login} />}
                />
                <Route
                  element={auth.authenticated ? <Shell onLogout={auth.logout} /> : <Navigate to="/login" replace />}
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="system/notifications" element={<Notifications />} />
                  <Route path="system/audit-log" element={<Protected routeKey="audit-log"><AuditLog /></Protected>} />
                  <Route path="system/users" element={<Protected routeKey="users"><Users /></Protected>} />
                  <Route path="inventory/products" element={<Protected routeKey="products"><Products /></Protected>} />
                  <Route path="inventory/stock-levels" element={<Protected routeKey="stock-levels"><StockLevels /></Protected>} />
                  <Route path="inventory/warehouses" element={<Protected routeKey="warehouses"><Warehouses /></Protected>} />
                  <Route path="inventory/stock-transfers" element={<Protected routeKey="stock-transfers"><StockTransfers /></Protected>} />
                  <Route path="inventory/purchase-orders" element={<Protected routeKey="purchase-orders"><PurchaseOrders /></Protected>} />
                  <Route path="inventory/suppliers" element={<Protected routeKey="suppliers"><Suppliers /></Protected>} />
                  <Route path="accounting/chart-of-accounts" element={<Protected routeKey="chart-of-accounts"><Accounts /></Protected>} />
                  <Route path="accounting/journal-entries" element={<Protected routeKey="journal-entries"><Journals /></Protected>} />
                  <Route path="accounting/sales-invoices" element={<Protected routeKey="sales-invoices"><Invoices /></Protected>} />
                  <Route path="accounting/payments" element={<Protected routeKey="payments"><Payments /></Protected>} />
                  <Route path="accounting/expenses" element={<Protected routeKey="expenses"><Expenses /></Protected>} />
                  <Route path="accounting/customers" element={<Protected routeKey="customers"><Customers /></Protected>} />
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

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
