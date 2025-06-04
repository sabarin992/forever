import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

export const API_BASE_URL = "https://forever.sabarinathem.xyz/api";

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      console.log(token);
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // console.log('original',originalRequest._retry);
    
    // If token expired and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          console.log('response refresh',res);
          

          const newAccessToken = res.data.access;
          localStorage.setItem(ACCESS_TOKEN, newAccessToken);

          // Retry original request with new access token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token invalid:", refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
