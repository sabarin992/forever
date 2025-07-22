import React from "react";
import { USER_ACCESS_TOKEN } from "../constants";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const getAccessToken = () => {
    const token = localStorage.getItem(USER_ACCESS_TOKEN);
    console.log(token);
  };
  const token = localStorage.getItem(USER_ACCESS_TOKEN);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
