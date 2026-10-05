import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../services/api';

type ItemPedido = {
  cantidad: number;
  precio_unitario: number;
  nombre: string;
};

type Pedido = {
  id: number;
  estado: string;
  subtotal: number;
  total: number;
  direccion_entrega: string | null;
  creado_en: string;
  items: ItemPedido[];
};

export default function PedidoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPedido();
  }, []);

  const cargarPedido = async () => {
    try {
      const respuesta = await api.get(`/pedidos/${id}`);
      setPedido(respuesta.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cargar el pedido');
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (cargando) {
    return (
      <View style={styles.contenedorCentro}>
        <ActivityIndicator color="#F2C229" size="large" />
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.contenedorCentro}>
        <Text style={styles.vacioTexto}>No se encontró el pedido</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.volver}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Pedido #{pedido.id}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.boletaCard}>
          <Text style={styles.boletaMarca}>KEBRACHO</Text>
          <Text style={styles.boletaFecha}>{formatearFecha(pedido.creado_en)}</Text>
          <Text style={styles.boletaEstado}>Estado: {pedido.estado}</Text>
          {pedido.direccion_entrega ? (
            <Text style={styles.boletaDireccion}>
              Entrega: {pedido.direccion_entrega}
            </Text>
          ) : null}

          <View style={styles.divisorPunteado} />

          {pedido.items.map((item, index) => (
            <View key={index} style={styles.itemFila}>
              <Text style={styles.itemNombre} numberOfLines={1}>
                {item.cantidad}x {item.nombre}
              </Text>
              <Text style={styles.itemPrecio}>
                ${(item.cantidad * item.precio_unitario).toLocaleString('es-AR')}
              </Text>
            </View>
          ))}

          <View style={styles.divisorPunteado} />

          <View style={styles.totalFila}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalMonto}>
              ${Number(pedido.total).toLocaleString('es-AR')}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    width: 60,
  },
  titulo: {
    color: '#FFF8E0',
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  boletaCard: {
    backgroundColor: '#2B2B2B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    padding: 20,
  },
  boletaMarca: {
    color: '#F2C229',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 4,
  },
  boletaFecha: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  boletaEstado: {
    color: '#9ca3af',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  boletaDireccion: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 4,
  },
  divisorPunteado: {
    borderTopWidth: 1,
    borderColor: '#3D3D3D',
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  itemFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemNombre: {
    color: '#FFF8E0',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  itemPrecio: {
    color: '#FFF8E0',
    fontSize: 14,
    fontWeight: '600',
  },
  totalFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '700',
  },
  totalMonto: {
    color: '#F2C229',
    fontSize: 20,
    fontWeight: '800',
  },
});