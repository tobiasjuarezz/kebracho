import api from '../services/api';

export async function agregarFavorito(productoId: number) {
  await api.post('/favoritos', { producto_id: productoId });
}

export async function quitarFavorito(productoId: number) {
  await api.delete(`/favoritos/${productoId}`);
}

export async function obtenerFavoritos() {
  const respuesta = await api.get('/favoritos');
  return respuesta.data;
}