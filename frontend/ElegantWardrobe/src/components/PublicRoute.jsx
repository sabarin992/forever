import React from 'react';
import { Navigate } from 'react-router-dom';
import { USER_ACCESS_TOKEN } from '../constants';

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem(USER_ACCESS_TOKEN);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
