import React from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../services/api';

export default function RoleRoute({ children, allowedRoles }) {
  if (!api.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = api.getUser();
  const userRole = user ? user.role : null;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to the appropriate home for their role
    if (userRole === 'SELLER') {
      return <Navigate to="/seller/dashboard" replace />;
    } else if (userRole === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}
