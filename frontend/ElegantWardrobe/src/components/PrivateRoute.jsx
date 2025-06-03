import React from "react";
import { ACCESS_TOKEN } from "../constants";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const getAccessToken = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    console.log(token);
  };
  const token = localStorage.getItem(ACCESS_TOKEN);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
