import React from 'react';
import { Navigate } from 'react-router-dom';
import { ACCESS_TOKEN } from '../constants';

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem(ACCESS_TOKEN);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
