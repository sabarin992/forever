// Example: AdminRoute.jsx
import { ADMIN_TOKEN } from '@/constants';
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminPrivateRoute = ({ children }) => {

  const token = localStorage.getItem(ADMIN_TOKEN);
  console.log(token);
  
  console.log(token);
  
  return token ? children : <Navigate to="/admin-login" />;
};

export default AdminPrivateRoute;
