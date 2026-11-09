import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { API_URL } from '../services/api';
import { autenticarConFaceId, dispositivoSoportaFaceId } from '../utils/biometria';
import LeyendaLegal from '../components/leyenda-legal';

type ItemCarrito = {
  id: number;
  producto_id: number;
  cantidad: number;
  nombre: string;
  precio: number;
};

type Carrito = {
  id: number;
  items: ItemCarrito[];
};

export default function CheckoutScreen() {
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [cargando, setCargando] = useState(true);
  const [direccion, setDireccion] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  // El usuario elige cómo confirmar la compra: con Face ID / huella o con la
  // misma contraseña con la que inicia sesión. Face ID solo aparece como opción
  // si lo activó y el celu lo soporta.
  const [faceIdDisponible, setFaceIdDisponible] = useState(false);
  const [metodo, setMetodo] = useState<'faceid' | 'password'>('password');

  useEffect(() => {
    const revisarFaceId = async () => {
      const activado = (await AsyncStorage.getItem('faceIdActivado')) === 'true';
      const soportado = activado && (await dispositivoSoportaFaceId());
      setFaceIdDisponible(soportado);
      setMetodo(soportado ? 'faceid' : 'password');
    };
    revisarFaceId();
  }, []);

  const usaFaceId = faceIdDisponible && metodo === 'faceid';

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

  const total =
    carrito?.items.reduce((acc, item) => acc + Number(item.precio) * item.cantidad, 0) ?? 0;

  const confirmarPedido = async () => {
    if (!direccion.trim()) {
      Alert.alert('Falta la dirección', 'Ingresá dónde querés recibir el pedido');
      return;
    }

    if (!carrito || carrito.items.length === 0) {
      Alert.alert('Carrito vacío', 'Agregá productos antes de confirmar');
      return;
    }

    if (usaFaceId) {
      setConfirmando(true);
      const exito = await autenticarConFaceId('Confirmá tu compra en Kebracho');
      if (!exito) {
        setConfirmando(false);
        // Si Face ID falla o lo cancela, le cambiamos a contraseña
        setMetodo('password');
        Alert.alert(
          'No se pudo verificar',
          'Ingresá tu contraseña de inicio de sesión para confirmar la compra.'
        );
        return;
      }
    } else {
      if (!passwordConfirmacion.trim()) {
        Alert.alert('Falta la contraseña', 'Ingresá tu contraseña para confirmar la compra');
        return;
      }

      setConfirmando(true);

      try {
        await api.post('/usuarios/verificar-password', { password: passwordConfirmacion });
      } catch (error: any) {
        const mensaje = error.response?.data?.error || 'No se pudo verificar la contraseña';
        Alert.alert('Error', mensaje);
        setConfirmando(false);
        return;
      }
    }

    try {
      const respuesta = await api.post('/pedidos', {
        direccion_entrega: direccion.trim(),
      });
      Alert.alert(
        '¡Pedido confirmado!',
        `Tu pedido #${respuesta.data.id} fue registrado. Te contactamos para coordinar el pago y la entrega.`,
        [
          {
            text: 'Listo',
            onPress: () => router.replace('/explore'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error confirmando pedido:', error?.code, error?.message, error?.response?.status);
      if (error.response) {
        // El servidor respondió con un error (stock, carrito vacío, etc.)
        Alert.alert('Error', error.response.data?.error || `Error ${error.response.status} del servidor`);
      } else if (error.code === 'ECONNABORTED') {
        Alert.alert(
          'El servidor tardó demasiado',
          `El pedido llegó a ${API_URL} pero no respondió a tiempo. Revisá la consola del backend.`
        );
      } else {
        Alert.alert(
          'Sin conexión con el servidor',
          `No se pudo llegar a ${API_URL}/pedidos (${error.message}). Revisá que el backend esté corriendo.`
        );
      }
    } finally {
      setConfirmando(false);
    }
  };

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
        <Text style={styles.titulo}>Confirmar pedido</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.seccionTitulo}>Resumen</Text>
        <View style={styles.resumenCard}>
          {items.map((item) => (
            <View key={item.id} style={styles.resumenFila}>
              <Text style={styles.resumenNombre} numberOfLines={1}>
                {item.cantidad}x {item.nombre}
              </Text>
              <Text style={styles.resumenPrecio}>
                ${(Number(item.precio) * item.cantidad).toLocaleString('es-AR')}
              </Text>
            </View>
          ))}
          <View style={styles.divisor} />
          <View style={styles.resumenFila}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalMonto}>
              ${total.toLocaleString('es-AR')}
            </Text>
          </View>
        </View>

        <Text style={styles.seccionTitulo}>Dirección de entrega</Text>
        <TextInput
          style={styles.input}
          placeholder="Calle, número, localidad"
          placeholderTextColor="#6b7280"
          value={direccion}
          onChangeText={setDireccion}
          multiline
        />

        <Text style={styles.seccionTitulo}>¿Cómo querés confirmar la compra?</Text>
        {faceIdDisponible && (
          <View style={styles.selector}>
            <TouchableOpacity
              style={[styles.opcion, metodo === 'faceid' && styles.opcionActiva]}
              onPress={() => setMetodo('faceid')}
              disabled={confirmando}
            >
              <Text style={[styles.opcionTexto, metodo === 'faceid' && styles.opcionTextoActivo]}>
                🔒 Face ID / huella
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.opcion, metodo === 'password' && styles.opcionActiva]}
              onPress={() => setMetodo('password')}
              disabled={confirmando}
            >
              <Text style={[styles.opcionTexto, metodo === 'password' && styles.opcionTextoActivo]}>
                🔑 Contraseña
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {usaFaceId ? (
          <Text style={[styles.aviso, { marginBottom: 16 }]}>
            Al confirmar te vamos a pedir Face ID / huella para validar la compra.
          </Text>
        ) : (
          <>
            <Text style={[styles.aviso, { marginBottom: 8 }]}>
              Ingresá la misma contraseña que usás para iniciar sesión.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tu contraseña"
              placeholderTextColor="#6b7280"
              value={passwordConfirmacion}
              onChangeText={setPasswordConfirmacion}
              secureTextEntry
            />
          </>
        )}

        <Text style={styles.aviso}>
          El pago se coordina por WhatsApp una vez confirmado el pedido (efectivo o
          transferencia).
        </Text>

        <LeyendaLegal style={{ marginTop: 12 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.botonConfirmar}
          onPress={confirmarPedido}
          disabled={confirmando}
        >
          <Text style={styles.botonConfirmarTexto}>
            {confirmando ? 'Confirmando...' : usaFaceId ? 'Confirmar con Face ID' : 'Confirmar con contraseña'}
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
  seccionTitulo: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
  },
  resumenCard: {
    backgroundColor: '#2B2B2B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    padding: 16,
    marginBottom: 24,
  },
  resumenFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resumenNombre: {
    color: '#FFF8E0',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  resumenPrecio: {
    color: '#FFF8E0',
    fontSize: 14,
    fontWeight: '600',
  },
  divisor: {
    height: 1,
    backgroundColor: '#3D3D3D',
    marginVertical: 8,
  },
  totalLabel: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '700',
  },
  totalMonto: {
    color: '#F2C229',
    fontSize: 18,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#2B2B2B',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 14,
    padding: 14,
    color: '#FFF8E0',
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  aviso: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 18,
  },
  selector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  opcion: {
    flex: 1,
    backgroundColor: '#2B2B2B',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  opcionActiva: {
    borderColor: '#F2C229',
    backgroundColor: '#3A3320',
  },
  opcionTexto: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  opcionTextoActivo: {
    color: '#F2C229',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
  },
  botonConfirmar: {
    backgroundColor: '#F2C229',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  botonConfirmarTexto: {
    color: '#1E1E1E',
    fontSize: 16,
    fontWeight: '700',
  },
});