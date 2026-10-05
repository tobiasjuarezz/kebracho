import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../services/api';
import LeyendaLegal from '../components/leyenda-legal';
import ImagenProducto from '../components/imagen-producto';
import { agregarFavorito, obtenerFavoritos, quitarFavorito } from '../utils/favoritos';

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_anterior: number | null;
  categoria_id: number;
  categoria_nombre?: string;
  stock: number;
  volumen_ml: number | null;
  graduacion_alcoholica: number | null;
  imagen_url: string | null;
};

export default function ProductoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);
  const [esFavorito, setEsFavorito] = useState(false);
  const [cambiandoFavorito, setCambiandoFavorito] = useState(false);

  useEffect(() => {
    cargarProducto();
    cargarEstadoFavorito();
  }, [id]);

  const cargarEstadoFavorito = async () => {
    try {
      const favoritos = await obtenerFavoritos();
      setEsFavorito(favoritos.some((f: { producto_id: number }) => f.producto_id === Number(id)));
    } catch (error) {
      console.error(error);
    }
  };

  const alternarFavorito = async () => {
    if (!producto || cambiandoFavorito) return;
    setCambiandoFavorito(true);
    try {
      if (esFavorito) {
        await quitarFavorito(producto.id);
        setEsFavorito(false);
      } else {
        await agregarFavorito(producto.id);
        setEsFavorito(true);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar tus favoritos');
    } finally {
      setCambiandoFavorito(false);
    }
  };

  const cargarProducto = async () => {
    try {
      const respuesta = await api.get(`/productos/${id}`);
      setProducto(respuesta.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cargar el producto');
    } finally {
      setCargando(false);
    }
  };

  const cambiarCantidad = (delta: number) => {
    setCantidad((prev) => {
      const nueva = prev + delta;
      if (nueva < 1) return 1;
      if (producto?.stock && nueva > producto.stock) return producto.stock;
      return nueva;
    });
  };

  const agregarAlCarrito = async () => {
    if (!producto) return;
    setAgregando(true);
    try {
      await api.post('/carrito/items', {
        producto_id: producto.id,
        cantidad,
      });
      Alert.alert('Listo', `${producto.nombre} se agregó al carrito`, [
        { text: 'Seguir viendo', style: 'cancel' },
        { text: 'Ir al carrito', onPress: () => router.push('/carrito') },
      ]);
    } catch (error: any) {
      const mensaje = error.response?.data?.error || 'No se pudo agregar al carrito';
      Alert.alert('Error', mensaje);
    } finally {
      setAgregando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.contenedorCentro}>
        <ActivityIndicator color="#F2C229" size="large" />
      </View>
    );
  }

  if (!producto) {
    return (
      <View style={styles.contenedorCentro}>
        <Text style={styles.vacioTexto}>No se encontró el producto</Text>
      </View>
    );
  }

  const subtotal = Number(producto.precio) * cantidad;

  return (
    <View style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.volver}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.headerAcciones}>
          <TouchableOpacity onPress={alternarFavorito} disabled={cambiandoFavorito}>
            <Text style={styles.corazon}>{esFavorito ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/carrito')}>
            <Text style={styles.carritoTexto}>🛒 Carrito</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.tagEnvio}>
          <Text style={styles.tagEnvioTexto}>Envío en 24/48hs</Text>
        </View>

        <ImagenProducto url={producto.imagen_url} tamanioEmoji={90} style={styles.imagenBox} />

        {producto.categoria_nombre ? (
          <View style={styles.categoriaChip}>
            <Text style={styles.categoriaChipTexto}>{producto.categoria_nombre}</Text>
          </View>
        ) : null}

        <Text style={styles.nombre}>{producto.nombre}</Text>
        <Text style={styles.descripcion}>{producto.descripcion}</Text>

        <View style={styles.precioFila}>
          {producto.precio_anterior ? (
            <Text style={styles.precioAnterior}>
              ${Number(producto.precio_anterior).toLocaleString('es-AR')}
            </Text>
          ) : null}
          <Text style={styles.precio}>
            ${Number(producto.precio).toLocaleString('es-AR')}
          </Text>
        </View>
        <Text style={styles.precioSubtexto}>Precio en efectivo o transferencia</Text>

        <View style={styles.detallesCard}>
          {producto.volumen_ml ? (
            <View style={styles.detalleFila}>
              <Text style={styles.detalleLabel}>Volumen</Text>
              <Text style={styles.detalleValor}>{producto.volumen_ml} ml</Text>
            </View>
          ) : null}
          {producto.graduacion_alcoholica ? (
            <View style={styles.detalleFila}>
              <Text style={styles.detalleLabel}>Graduación alcohólica</Text>
              <Text style={styles.detalleValor}>{producto.graduacion_alcoholica}°</Text>
            </View>
          ) : null}
          <View style={styles.detalleFila}>
            <Text style={styles.detalleLabel}>Stock disponible</Text>
            <Text style={styles.detalleValor}>
              {producto.stock > 0 ? `${producto.stock} unidades` : 'Sin stock'}
            </Text>
          </View>
        </View>

        <Text style={styles.seccionTitulo}>Cantidad</Text>
        <View style={styles.selectorCantidad}>
          <TouchableOpacity
            style={styles.botonCantidad}
            onPress={() => cambiarCantidad(-1)}
          >
            <Text style={styles.botonCantidadTexto}>−</Text>
          </TouchableOpacity>
          <Text style={styles.cantidadTexto}>{cantidad}</Text>
          <TouchableOpacity
            style={styles.botonCantidad}
            onPress={() => cambiarCantidad(1)}
          >
            <Text style={styles.botonCantidadTexto}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.subtotalFila}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalMonto}>
            ${subtotal.toLocaleString('es-AR')}
          </Text>
        </View>

        <LeyendaLegal style={{ marginTop: 16 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.botonAgregar, producto.stock === 0 && styles.botonDeshabilitado]}
          onPress={agregarAlCarrito}
          disabled={agregando || producto.stock === 0}
        >
          <Text style={styles.botonAgregarTexto}>
            {producto.stock === 0
              ? 'Sin stock'
              : agregando
              ? 'Agregando...'
              : '+ Agregar al carrito'}
          </Text>
        </TouchableOpacity>
      </View>
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
  vacioTexto: {
    color: '#9ca3af',
    fontSize: 15,
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
  },
  headerAcciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  corazon: {
    fontSize: 22,
  },
  carritoTexto: {
    color: '#F2C229',
    fontSize: 15,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  tagEnvio: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2C229',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  tagEnvioTexto: {
    color: '#1E1E1E',
    fontSize: 11,
    fontWeight: '700',
  },
  imagenBox: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    backgroundColor: '#2B2B2B',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagenEmoji: {
    fontSize: 90,
  },
  categoriaChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#2B2B2B',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoriaChipTexto: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  nombre: {
    color: '#FFF8E0',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  descripcion: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  precioFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  precioAnterior: {
    color: '#6b7280',
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  precio: {
    color: '#F2C229',
    fontSize: 28,
    fontWeight: '800',
  },
  precioSubtexto: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 20,
  },
  detallesCard: {
    backgroundColor: '#2B2B2B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    padding: 16,
    marginBottom: 24,
  },
  detalleFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detalleLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  detalleValor: {
    color: '#FFF8E0',
    fontSize: 14,
    fontWeight: '600',
  },
  seccionTitulo: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  selectorCantidad: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B2B2B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 20,
  },
  botonCantidad: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonCantidadTexto: {
    color: '#FFF8E0',
    fontSize: 20,
    fontWeight: '700',
  },
  cantidadTexto: {
    color: '#FFF8E0',
    fontSize: 17,
    fontWeight: '700',
    marginHorizontal: 20,
    minWidth: 20,
    textAlign: 'center',
  },
  subtotalFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
  },
  subtotalLabel: {
    color: '#9ca3af',
    fontSize: 15,
  },
  subtotalMonto: {
    color: '#FFF8E0',
    fontSize: 20,
    fontWeight: '800',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
  },
  botonAgregar: {
    backgroundColor: '#F2C229',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#3a3a3a',
  },
  botonAgregarTexto: {
    color: '#1E1E1E',
    fontSize: 16,
    fontWeight: '700',
  },
});