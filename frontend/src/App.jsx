import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import VerifyOtp from './components/VerifyOtp';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import CustomerHome from './components/CustomerHome';
import ProductsPage from './components/ProductsPage';
import ProductDetailPage from './components/ProductDetailPage';
import WishlistPage from './components/WishlistPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import Dashboard from './components/Dashboard';
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import RoleRoute from './components/RoleRoute';
import ProtectedRoute from './components/ProtectedRoute';
import ChatbotWidget from './components/ChatbotWidget';

import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import TermsPage from './components/TermsPage';
import ShippingPolicyPage from './components/ShippingPolicyPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Dedicated Admin Login Route */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Public Catalog & Browsing Routes (No Auth Required) */}
        <Route path="/" element={<CustomerHome />} />
        <Route path="/home" element={<CustomerHome />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Customer Routes (Auth Required) */}
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wishlist" 
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/address" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Seller & Admin Routes */}
        <Route 
          path="/seller/dashboard" 
          element={
            <RoleRoute allowedRoles={['SELLER']}>
              <SellerDashboard />
            </RoleRoute>
          } 
        />
        <Route 
          path="/seller/products" 
          element={
            <RoleRoute allowedRoles={['SELLER']}>
              <SellerDashboard />
            </RoleRoute>
          } 
        />
        <Route 
          path="/seller/orders" 
          element={
            <RoleRoute allowedRoles={['SELLER']}>
              <SellerDashboard />
            </RoleRoute>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </RoleRoute>
          } 
        />

        {/* Catch-all Default Route -> Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatbotWidget />
    </Router>
  );
}
