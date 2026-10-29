import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();
const baseURL = configuredBaseUrl
  ? `${configuredBaseUrl.replace(/\/+$/, '')}${configuredBaseUrl.replace(/\/+$/, '').endsWith('/api') ? '' : '/api'}`
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 30000,
});

export default api;
