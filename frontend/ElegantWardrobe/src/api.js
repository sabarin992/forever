import axios from "axios";
import { USER_ACCESS_TOKEN, USER_REFRESH_TOKEN, ADMIN_ACCESS_TOKEN, ADMIN_REFRESH_TOKEN } from "./constants";
export const API_BASE_URL = "https://forever.sabarinathem.xyz/api";
// export const API_BASE_URL = "http://127.0.0.1:8000/api";



// ----- User API Instance -----

// Create Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// request interceptor
api.interceptors.request.use( // Add access token to every request
  (config) => {
    const token = localStorage.getItem(USER_ACCESS_TOKEN);
    if (token) {
      console.log(`api token = ${token}`);
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Response Interceptor
api.interceptors.response.use( // Handle token expiration and refresh
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // console.log('original',originalRequest._retry);
    
    // If token expired and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem(USER_REFRESH_TOKEN);

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          console.log('response refresh',res);
          

          const newAccessToken = res.data.access;
          localStorage.setItem(USER_ACCESS_TOKEN, newAccessToken);

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


// ----- Admin API Instance -----

// Create Axios instance
export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// request interceptor
adminApi.interceptors.request.use( // Add access token to every request
  (config) => {
    const token = localStorage.getItem(ADMIN_ACCESS_TOKEN);
    console.log(token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log(config.headers.Authorization);
      
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Response Interceptor
adminApi.interceptors.response.use( // Handle token expiration and refresh
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // console.log('original',originalRequest._retry);
    
    // If token expired and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem(ADMIN_REFRESH_TOKEN);

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          console.log('response refresh',res);
          

          const newAccessToken = res.data.access;
          localStorage.setItem(ADMIN_ACCESS_TOKEN, newAccessToken);

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

export default api


