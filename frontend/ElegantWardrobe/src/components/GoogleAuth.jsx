import React from 'react';
import { GoogleLogin } from '@react-oauth/google'; 

import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { toast } from 'react-toastify';

const GoogleAuth = () => {
    const navigate = useNavigate()
  const handleSuccess = async (response) => {
    const token = response.credential; // Google token
    console.log(token)

    try {
      // Send token to Django backend
      const res = await api.post('/google-login/', {
        token,
      });

      // Store tokens (e.g. in localStorage or Redux)
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      toast.success("Login Successful");
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleError = (error) => {
    console.error('Google Login Error:', error);
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap // Optional: Enable one-tap login
      />
    </div>
  );
};

export default GoogleAuth;