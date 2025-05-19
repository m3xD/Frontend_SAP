import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { getTokenFromLocalStorage, getRefreshTokenFromLocalStorage } from './localStorageUtils';
import authService from '../services/authService';

// Keep track of the refresh token request to prevent multiple refreshes
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Function to add callbacks to the subscriber list
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Function to notify all subscribers with the new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

/**
 * Creates an axios instance with token refresh interceptors
 * @param {string} baseURL - The base URL for the API
 * @returns {AxiosInstance} - Configured axios instance
 */
export const createApiInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
  });

  // Store retried requests in a WeakMap instead of using headers
  const retriedRequests = new WeakMap();

  // Request interceptor - just adds token to requests
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Get the token from localStorage
      const token = getTokenFromLocalStorage();
      
      // If token exists, add it to the request
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handles 401/403 errors
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // Only proceed for 401 Unauthorized or 403 Forbidden responses
      if (![401, 403].includes(error.response?.status || 0)) {
        return Promise.reject(error);
      }
      
      const originalRequest = error.config;
      
      // Skip if we don't have a config to retry or we've already retried
      if (!originalRequest || retriedRequests.has(originalRequest)) {
        return Promise.reject(error);
      }
      
      // Mark this request as retried using WeakMap instead of modifying headers
      retriedRequests.set(originalRequest, true);
      
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        console.log('Token refresh already in progress, queuing request');
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            // Use the instance instead of global axios
            resolve(instance(originalRequest));
          });
        });
      }
      
      console.log('Attempting to refresh token due to 401/403 response');
      isRefreshing = true;
      
      try {
        const refreshToken = getRefreshTokenFromLocalStorage();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const { token: newToken, newRefreshToken } = await authService.refreshToken(refreshToken);
        
        // Store new tokens
        localStorage.setItem('token', newToken);
        console.log("check set new token after refresh: ", newToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        console.log("check set new refresh token after refresh: ", newRefreshToken);
        
        // Update auth header for current request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Process any queued requests
        onTokenRefreshed(newToken);
        
        console.log('Token refreshed successfully, retrying original request');
        isRefreshing = false;
        
        // Use the instance instead of global axios
        return instance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear auth state on refresh failure
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        
        // Reset flag before redirecting
        isRefreshing = false;
        
        // Redirect to login page
        window.location.href = '/signin';
        
        return Promise.reject(refreshError);
      }
    }
  );

  return instance;
};

// Create specific API instances for different services
export const authApi = createApiInstance('https://auth-service-6f3ceb0b5b52.herokuapp.com');
export const mainApi = createApiInstance('https://api-sap.m3xd.dev/assessments');
export const aiApi = createApiInstance('https://api-sap.m3xd.dev/ai');
export const proctorApi = createApiInstance('https://api-sap.m3xd.dev/proctoring-service');