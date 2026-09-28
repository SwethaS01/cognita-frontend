import axios from 'axios';

// Dev: backend runs on Render. Production: the backend serves the frontend, so use same-origin /api.
export const API_URL =
  import.meta.env.VITE_API_URL || 'https://cognita-backend.onrender.com/api';
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'https://cognita-backend.onrender.com';

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('cn_token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export default api;
