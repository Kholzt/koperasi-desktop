import axiosLib from 'axios';

const PORT = import.meta.env.VITE_APP_PORT
// Buat instance axios
const axios = axiosLib.create({
  baseURL: `http://localhost:${PORT}`, // Ganti sesuai API yang digunakan
  timeout: 10000, // Timeout 10 detik
  headers: {
    'Content-Type': 'application/json',
    // Tambahkan header lain jika perlu
  }
});

// Interceptor request (opsional)
axios.interceptors.request.use(
  (config) => {
    // Contoh: tambahkan token kalau ada
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['x-app-secret'] = import.meta.env.VITE_APP_SECRET;

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response (opsional)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios error:', error);
    return Promise.reject(error);
  }
);

export default axios;
