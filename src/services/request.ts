import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from './apiBase';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // set to true if using cookies for auth
});

// Add interceptors for auth, error handling, etc. if needed
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // You can customize error handling here
    if (error.response) {
      // Server responded with a status other than 2xx
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: error.message || 'Network error' });
  }
);

export const request = async <T = any>(config: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.request<T>(config);
  return response.data;
};

export default axiosInstance;
