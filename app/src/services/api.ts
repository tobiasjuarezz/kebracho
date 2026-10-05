import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { router } from 'expo-router';

// Si estás usando Expo Go, la app ya sabe la IP de tu compu (es la misma de Metro),
// así que la usamos para llegar al backend sin tener que cambiarla a mano cada vez
// que cambiás de red. Si no la encuentra, usa la IP fija de abajo.
const IP_FIJA = '172.20.10.2';
const PUERTO_BACKEND = 3000;

function obtenerApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri; // ej: "192.168.0.15:8081"
  const ip = hostUri ? hostUri.split(':')[0] : IP_FIJA;
  return `http://${ip}:${PUERTO_BACKEND}`;
}

export const API_URL = obtenerApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Borra la sesión guardada en el celular
export async function cerrarSesion() {
  await AsyncStorage.multiRemove(['token', 'usuario']);
}

// Si el token venció (dura 7 días) el backend responde 401:
// cerramos la sesión y mandamos al login en vez de mostrar errores raros.
// Login y verificar-password devuelven 401 por contraseña incorrecta, esos no cuentan.
api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const url: string = error.config?.url || '';
    const esLoginOPassword = url.includes('/usuarios/login') || url.includes('/usuarios/verificar-password');
    if (error.response?.status === 401 && !esLoginOPassword) {
      await cerrarSesion();
      router.replace('/');
    }
    return Promise.reject(error);
  }
);

export default api;
