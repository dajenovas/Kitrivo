import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/layout/AppLayout';
import HomePage from '@/page/Home/HomePage';

const ProductsPage = lazy(() => import('@/page/Products/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/page/ProductDetail/ProductDetailPage'));
const ProjectsPage = lazy(() => import('@/page/Projects/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/page/ProjectDetail/ProjectDetailPage'));
const CartPage = lazy(() => import('@/page/Cart/CartPage'));
const CheckoutPage = lazy(() => import('@/page/Checkout/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/page/OrderConfirmation/OrderConfirmationPage'));
const ContactPage = lazy(() => import('@/page/Contact/ContactPage'));
const LegalPage = lazy(() => import('@/page/Legal/LegalPage'));
const NotFoundPage = lazy(() => import('@/page/NotFound/NotFoundPage'));

const AppRoutes = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:slug" element={<ProjectDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/terms" element={<LegalPage kind="terms" />} />
      <Route path="/privacy" element={<LegalPage kind="privacy" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default AppRoutes;
