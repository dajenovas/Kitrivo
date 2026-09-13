import AppLayout from '@/layout/AppLayout';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import LoginPage from '@/pages/login/LoginPage';
import UserManagementPage from '@/pages/users/UserManagementPage';
import RolesListPage from '@/pages/roles/RolesListPage';
import PermissionsListPage from '@/pages/permissions/PermissionsListPage';
import ProductManagementPage from '@/pages/products/ProductManagementPage';
import ProductShowcasePage from '@/pages/showcase/ProductShowcasePage';
import LabManualsPage from '@/pages/resources/LabManualsPage';
import DemoVideosPage from '@/pages/resources/DemoVideosPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import CartPage from '@/pages/cart/CartPage';
import CompanyManagementPage from '@/pages/company/CompanyManagementPage';
import StockManagementPage from '@/pages/stock/StockManagementPage';
import CustomerManagementPage from '@/pages/customer/CustomerManagementPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { QuotationHistoryPage } from '@/pages/quotations/QuotationHistoryPage';
import { BillHistoryPage } from '@/pages/billing/BillHistoryPage';
import { SystemLogsPage } from '@/pages/logs/SystemLogsPage';
import { tokenStore } from '@/api/Client';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const ProtectedRoute = () => {
  const token = tokenStore.getAccessToken();
  const refreshToken = tokenStore.getRefreshToken();
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    if ((token || refreshToken) && !user) {
      fetchMe();
    }
  }, [token, refreshToken, user, fetchMe]);

  if (!token && !refreshToken) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/roles" element={<RolesListPage />} />
          <Route path="/permissions" element={<PermissionsListPage />} />
          <Route path="/products" element={<ProductManagementPage />} />
          <Route path="/stock" element={<StockManagementPage />} />
          <Route path="/showcase" element={<ProductShowcasePage />} />
          <Route path="/lab-manuals" element={<LabManualsPage />} />
          <Route path="/demo-videos" element={<DemoVideosPage />} />
          <Route path="/companies" element={<CompanyManagementPage />} />
          <Route path="/customers" element={<CustomerManagementPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/quotations" element={<QuotationHistoryPage />} />
          <Route path="/bills" element={<BillHistoryPage />} />
          <Route path="/logs" element={<SystemLogsPage />} />
        </Route>
      </Route>




      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;