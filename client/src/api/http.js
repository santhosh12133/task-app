import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  timeout: 15000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('orion_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('orion_token');
    }
    return Promise.reject(error);
  }
);

export default http;
