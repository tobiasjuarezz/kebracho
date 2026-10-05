import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { obtenerFavoritos, quitarFavorito } from '../utils/favoritos';

type Favorito = {
  id: number;
  producto_id: number;
  nombre: string;
  precio: number;
  precio_anterior: number | null;
  categoria_id: number;
};

export default function FavoritosScreen() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      cargarFavoritos();
    }, [])
  );

  const cargarFavoritos = async () => {
    try {
      const datos = await obtenerFavoritos();
      setFavoritos(datos);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar tus favoritos');
    } finally {
      setCargando(false);
    }
  };

  const eliminar = async (productoId: number) => {
    try {
      await quitarFavorito(productoId);
      setFavoritos((prev) => prev.filter((f) => f.producto_id !== productoId));
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo quitar de favoritos');
    }
  };

  const verProducto = (productoId: number) => {
    router.push({ pathname: '/producto', params: { id: productoId } });
  };

  if (cargando) {
    return (
      <View style={styles.contenedorCentro}>
        <ActivityIndicator color="#F2C229" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.volver}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Favoritos</Text>
        <View style={{ width: 60 }} />
      </View>

      {favoritos.length === 0 ? (
        <View style={styles.vacioContenedor}>
          <Text style={styles.vacioEmoji}>🤍</Text>
          <Text style={styles.vacioTexto}>Todavía no marcaste ningún favorito</Text>
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.producto_id.toString()}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.info}
                onPress={() => verProducto(item.producto_id)}
              >
                <Text style={styles.nombre} numberOfLines={2}>
                  {item.nombre}
                </Text>
                <View style={styles.precioFila}>
                  {item.precio_anterior ? (
                    <Text style={styles.precioAnterior}>
                      ${Number(item.precio_anterior).toLocaleString('es-AR')}
                    </Text>
                  ) : null}
                  <Text style={styles.precio}>
                    ${Number(item.precio).toLocaleString('es-AR')}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonCorazon}
                onPress={() => eliminar(item.producto_id)}
              >
                <Text style={styles.corazonTexto}>❤️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  contenedorCentro: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  volver: {
    color: '#F2C229',
    fontSize: 15,
    fontWeight: '600',
    width: 60,
  },
  titulo: {
    color: '#FFF8E0',
    fontSize: 18,
    fontWeight: '700',
  },
  vacioContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  vacioEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  vacioTexto: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B2B2B',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    padding: 16,
    marginBottom: 12,
  },
  info: {
    flex: 1,
  },
  nombre: {
    color: '#FFF8E0',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  precioFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  precioAnterior: {
    color: '#6b7280',
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  precio: {
    color: '#F2C229',
    fontSize: 16,
    fontWeight: '800',
  },
  botonCorazon: {
    padding: 8,
  },
  corazonTexto: {
    fontSize: 22,
  },
});