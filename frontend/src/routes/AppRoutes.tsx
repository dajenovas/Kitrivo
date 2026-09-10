import AppLayout from '@/layout/AppLayout';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import LoginPage from '@/pages/login/LoginPage';
import UserManagementPage from '@/pages/users/UserManagementPage';
import RolesListPage from '@/pages/roles/RolesListPage';
import PermissionsListPage from '@/pages/permissions/PermissionsListPage';
import ProductManagementPage from '@/pages/products/ProductManagementPage';
import ProductShowcasePage from '@/pages/showcase/ProductShowcasePage';
import { tokenStore } from '@/api/Client';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const ProtectedRoute = () => {
  const token = tokenStore.getAccessToken();
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    if (token && !tokenStore.isExpired() && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  if (!token || tokenStore.isExpired()) {
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
          <Route path="/showcase" element={<ProductShowcasePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;