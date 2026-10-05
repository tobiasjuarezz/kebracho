import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../services/api';
import LeyendaLegal from '../components/leyenda-legal';
import ImagenProducto from '../components/imagen-producto';

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_anterior: number | null;
  categoria_id: number;
  categoria_nombre?: string;
  imagen_url: string | null;
};

export default function ProductosScreen() {
  const { categoriaId, nombre } = useLocalSearchParams<{
    categoriaId: string;
    nombre: string;
  }>();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, [categoriaId]);

  const cargarProductos = async () => {
    setCargando(true);
    try {
      // El filtro lo hace el backend, así no bajamos todo el catálogo
      const respuesta = await api.get('/productos', { params: { categoriaId } });
      setProductos(respuesta.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setCargando(false);
    }
  };

  const agregarAlCarrito = async (producto: Producto) => {
    try {
      await api.post('/carrito/items', { producto_id: producto.id, cantidad: 1 });
      Alert.alert('Listo', `${producto.nombre} se agregó al carrito`);
    } catch (error: any) {
      const mensaje = error.response?.data?.error || 'No se pudo agregar al carrito';
      Alert.alert('Error', mensaje);
    }
  };

  const verProducto = (producto: Producto) => {
    router.push({ pathname: '/producto', params: { id: producto.id } });
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
        <Text style={styles.titulo} numberOfLines={1}>
          {nombre}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {productos.length === 0 ? (
        <View style={styles.vacioContenedor}>
          <Text style={styles.vacioTexto}>
            Todavía no hay productos en esta categoría
          </Text>
        </View>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.lista}
          ListFooterComponent={<LeyendaLegal />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.tagEnvio}>
                <Text style={styles.tagEnvioTexto}>Envío en 24/48hs</Text>
              </View>

              <ImagenProducto url={item.imagen_url} tamanioEmoji={56} style={styles.imagenBox} />

              <View style={styles.categoriaChip}>
                <Text style={styles.categoriaChipTexto}>{nombre}</Text>
              </View>

              <Text style={styles.nombre} numberOfLines={2}>
                {item.nombre}
              </Text>
              <Text style={styles.descripcion} numberOfLines={2}>
                {item.descripcion}
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
              <Text style={styles.precioSubtexto}>
                Precio en efectivo o transferencia
              </Text>

              <TouchableOpacity
                style={styles.botonVer}
                onPress={() => verProducto(item)}
              >
                <Text style={styles.botonVerTexto}>Ver producto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botonAgregar}
                onPress={() => agregarAlCarrito(item)}
              >
                <Text style={styles.botonAgregarTexto}>+ Agregar al carrito</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fabCarrito}
        onPress={() => router.push('/carrito')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabCarritoEmoji}>🛒</Text>
      </TouchableOpacity>
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
    flex: 1,
    textAlign: 'center',
  },
  vacioContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  vacioTexto: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#2B2B2B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    padding: 16,
    marginBottom: 16,
  },
  tagEnvio: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#F2C229',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  tagEnvioTexto: {
    color: '#1E1E1E',
    fontSize: 11,
    fontWeight: '700',
  },
  imagenBox: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagenEmoji: {
    fontSize: 56,
  },
  categoriaChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoriaChipTexto: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  nombre: {
    color: '#FFF8E0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  descripcion: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 10,
  },
  precioFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  precioAnterior: {
    color: '#6b7280',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  precio: {
    color: '#F2C229',
    fontSize: 20,
    fontWeight: '800',
  },
  precioSubtexto: {
    color: '#6b7280',
    fontSize: 11,
    marginBottom: 14,
  },
  botonVer: {
    borderWidth: 1,
    borderColor: '#F2C229',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  botonVerTexto: {
    color: '#F2C229',
    fontWeight: '700',
    fontSize: 14,
  },
  botonAgregar: {
    backgroundColor: '#F2C229',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  botonAgregarTexto: {
    color: '#1E1E1E',
    fontWeight: '700',
    fontSize: 14,
  },
  fabCarrito: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F2C229',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabCarritoEmoji: {
    fontSize: 26,
  },
});