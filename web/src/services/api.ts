import axios from 'axios';

// Se puede cambiar con un archivo .env (VITE_API_URL=http://...) sin tocar el código
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function usuarioLogueado(): { nombre: string } | null {
  try {
    const guardado = localStorage.getItem('usuario');
    return localStorage.getItem('token') && guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

// Si no hay sesión o el token venció, el backend responde 401:
// limpiamos la sesión y mandamos al login (menos en el propio login, donde 401 = contraseña mal)
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const url: string = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/usuarios/login')) {
      cerrarSesion();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
