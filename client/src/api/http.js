import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const http = axios.create({
  baseURL: apiUrl,
  withCredentials: true
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('issuepilot_jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
