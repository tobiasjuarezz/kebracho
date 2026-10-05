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
import api from '../services/api';
import ImagenProducto from '../components/imagen-producto';

type ItemCarrito = {
  id: number;
  producto_id: number;
  cantidad: number;
  nombre: string;
  precio: number;
  imagen_url: string | null;
};

type Carrito = {
  id: number;
  items: ItemCarrito[];
};

export default function CarritoScreen() {
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState<number | null>(null);

  // useFocusEffect para que se refresque cada vez que volvés a esta pantalla
  useFocusEffect(
    useCallback(() => {
      cargarCarrito();
    }, [])
  );

  const cargarCarrito = async () => {
    try {
      const respuesta = await api.get('/carrito');
      setCarrito(respuesta.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cargar el carrito');
    } finally {
      setCargando(false);
    }
  };

  const cambiarCantidad = async (item: ItemCarrito, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) {
      eliminarItem(item);
      return;
    }
    setActualizando(item.id);
    try {
      await api.put(`/carrito/items/${item.id}`, { cantidad: nuevaCantidad });
      setCarrito((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                i.id === item.id ? { ...i, cantidad: nuevaCantidad } : i
              ),
            }
          : prev
      );
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.error || 'No se pudo actualizar la cantidad');
    } finally {
      setActualizando(null);
    }
  };

  const eliminarItem = (item: ItemCarrito) => {
    Alert.alert('Eliminar', `¿Sacar "${item.nombre}" del carrito?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setActualizando(item.id);
          try {
            await api.delete(`/carrito/items/${item.id}`);
            setCarrito((prev) =>
              prev
                ? { ...prev, items: prev.items.filter((i) => i.id !== item.id) }
                : prev
            );
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo eliminar el producto');
          } finally {
            setActualizando(null);
          }
        },
      },
    ]);
  };

  const irACheckout = () => {
    if (!carrito || carrito.items.length === 0) {
      Alert.alert('Carrito vacío', 'Agregá productos antes de continuar');
      return;
    }
    router.push('/checkout');
  };

  const total =
    carrito?.items.reduce((acc, item) => acc + Number(item.precio) * item.cantidad, 0) ?? 0;

  if (cargando) {
    return (
      <View style={styles.contenedorCentro}>
        <ActivityIndicator color="#F2C229" size="large" />
      </View>
    );
  }

  const items = carrito?.items ?? [];

  return (
    <View style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.volver}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Tu carrito</Text>
        <View style={{ width: 60 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.vacioContenedor}>
          <Text style={styles.vacioEmoji}>🛒</Text>
          <Text style={styles.vacioTexto}>Todavía no agregaste nada</Text>
          <TouchableOpacity style={styles.botonExplorar} onPress={() => router.push('/explore')}>
            <Text style={styles.botonExplorarTexto}>Ver categorías</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.lista}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <ImagenProducto url={item.imagen_url} tamanioEmoji={32} style={styles.imagenBox} />
                <View style={styles.info}>
                  <Text style={styles.nombre} numberOfLines={2}>
                    {item.nombre}
                  </Text>
                  <Text style={styles.precio}>
                    ${Number(item.precio).toLocaleString('es-AR')}
                  </Text>
                  <View style={styles.controles}>
                    <TouchableOpacity
                      style={styles.botonCantidad}
                      onPress={() => cambiarCantidad(item, item.cantidad - 1)}
                      disabled={actualizando === item.id}
                    >
                      <Text style={styles.botonCantidadTexto}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.cantidad}>{item.cantidad}</Text>
                    <TouchableOpacity
                      style={styles.botonCantidad}
                      onPress={() => cambiarCantidad(item, item.cantidad + 1)}
                      disabled={actualizando === item.id}
                    >
                      <Text style={styles.botonCantidadTexto}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.eliminar}
                      onPress={() => eliminarItem(item)}
                      disabled={actualizando === item.id}
                    >
                      <Text style={styles.eliminarTexto}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.totalFila}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalMonto}>
                ${total.toLocaleString('es-AR')}
              </Text>
            </View>
            <TouchableOpacity style={styles.botonComprar} onPress={irACheckout}>
              <Text style={styles.botonComprarTexto}>Finalizar compra</Text>
            </TouchableOpacity>
          </View>
        </>
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
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  botonExplorar: {
    backgroundColor: '#F2C229',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  botonExplorarTexto: {
    color: '#1E1E1E',
    fontWeight: '700',
    fontSize: 15,
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#2B2B2B',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    padding: 12,
    marginBottom: 12,
  },
  imagenBox: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imagenEmoji: {
    fontSize: 32,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  nombre: {
    color: '#FFF8E0',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  precio: {
    color: '#F2C229',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  controles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botonCantidad: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonCantidadTexto: {
    color: '#FFF8E0',
    fontSize: 16,
    fontWeight: '700',
  },
  cantidad: {
    color: '#FFF8E0',
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 16,
    textAlign: 'center',
  },
  eliminar: {
    marginLeft: 'auto',
  },
  eliminarTexto: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
    backgroundColor: '#1E1E1E',
  },
  totalFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    color: '#9ca3af',
    fontSize: 15,
  },
  totalMonto: {
    color: '#FFF8E0',
    fontSize: 22,
    fontWeight: '800',
  },
  botonComprar: {
    backgroundColor: '#F2C229',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  botonComprarTexto: {
    color: '#1E1E1E',
    fontSize: 16,
    fontWeight: '700',
  },
});