import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import api from '../services/api';

type Pedido = {
  id: number;
  estado: string;
  total: number;
  creado_en: string;
};

export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      cargarPedidos();
    }, [])
  );

  const cargarPedidos = async () => {
    try {
      const respuesta = await api.get('/pedidos');
      setPedidos(respuesta.data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const estadoColor: Record<string, string> = {
    pendiente: '#F2C229',
    confirmado: '#3b82f6',
    entregado: '#22c55e',
    cancelado: '#ef4444',
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
        <Text style={styles.titulo}>Mis pedidos</Text>
        <View style={{ width: 60 }} />
      </View>

      {pedidos.length === 0 ? (
        <View style={styles.vacioContenedor}>
          <Text style={styles.vacioEmoji}>🧾</Text>
          <Text style={styles.vacioTexto}>Todavía no hiciste ningún pedido</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/pedido-detalle', params: { id: item.id } })}
            >
              <View style={styles.cardFilaSuperior}>
                <Text style={styles.pedidoNumero}>Pedido #{item.id}</Text>
                <View
                  style={[
                    styles.estadoChip,
                    { backgroundColor: (estadoColor[item.estado] || '#9ca3af') + '22' },
                  ]}
                >
                  <Text style={[styles.estadoTexto, { color: estadoColor[item.estado] || '#9ca3af' }]}>
                    {item.estado}
                  </Text>
                </View>
              </View>
              <Text style={styles.pedidoFecha}>{formatearFecha(item.creado_en)}</Text>
              <View style={styles.divisor} />
              <View style={styles.cardFilaInferior}>
                <Text style={styles.verDetalle}>Ver detalle →</Text>
                <Text style={styles.pedidoTotal}>
                  ${Number(item.total).toLocaleString('es-AR')}
                </Text>
              </View>
            </TouchableOpacity>
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
    backgroundColor: '#2B2B2B',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    padding: 16,
    marginBottom: 12,
  },
  cardFilaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pedidoNumero: {
    color: '#FFF8E0',
    fontSize: 15,
    fontWeight: '700',
  },
  estadoChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  estadoTexto: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  pedidoFecha: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 12,
  },
  divisor: {
    height: 1,
    backgroundColor: '#3D3D3D',
    marginBottom: 12,
  },
  cardFilaInferior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verDetalle: {
    color: '#F2C229',
    fontSize: 13,
    fontWeight: '600',
  },
  pedidoTotal: {
    color: '#FFF8E0',
    fontSize: 17,
    fontWeight: '800',
  },
});