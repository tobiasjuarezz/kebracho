import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { autenticarConFaceId, dispositivoSoportaFaceId } from '../utils/biometria';

export default function ActivarFaceIdScreen() {
  const [procesando, setProcesando] = useState(false);

  const activar = async () => {
    setProcesando(true);
    try {
      const soportado = await dispositivoSoportaFaceId();

      if (!soportado) {
        Alert.alert(
          'No disponible',
          'Tu dispositivo no tiene Face ID/huella configurado. Vas a poder seguir usando la app sin esta protección extra.',
          [
            {
              text: 'Entendido',
              onPress: async () => {
                await AsyncStorage.setItem('faceIdConfigurado', 'true');
                await AsyncStorage.setItem('faceIdActivado', 'false');
                router.replace('/explore');
              },
            },
          ]
        );
        return;
      }

      const exito = await autenticarConFaceId('Activá Face ID para tu cuenta de Kebracho');

      if (exito) {
        await AsyncStorage.setItem('faceIdConfigurado', 'true');
        await AsyncStorage.setItem('faceIdActivado', 'true');
        Alert.alert('¡Listo!', 'Face ID activado correctamente', [
          { text: 'Continuar', onPress: () => router.replace('/explore') },
        ]);
      } else {
        Alert.alert('No se pudo verificar', 'Intentá de nuevo para continuar');
      }
    } finally {
      setProcesando(false);
    }
  };

  // Si la verificación falla o el usuario no quiere usar Face ID, puede seguir igual:
  // en ese caso las compras se confirman con la contraseña.
  const omitir = async () => {
    await AsyncStorage.setItem('faceIdConfigurado', 'true');
    await AsyncStorage.setItem('faceIdActivado', 'false');
    router.replace('/explore');
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.titulo}>Activá Face ID</Text>
        <Text style={styles.texto}>
          Activá Face ID o huella para ingresar más rápido a tu cuenta de Kebracho y
          confirmar tus compras de forma segura.
        </Text>
        <TouchableOpacity
          style={styles.boton}
          onPress={activar}
          disabled={procesando}
        >
          <Text style={styles.botonTexto}>
            {procesando ? 'Verificando...' : 'Activar Face ID'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonOmitir} onPress={omitir} disabled={procesando}>
          <Text style={styles.botonOmitirTexto}>Ahora no (uso mi contraseña)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#2B2B2B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    padding: 28,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  titulo: {
    color: '#FFF8E0',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  texto: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  boton: {
    backgroundColor: '#F2C229',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  botonTexto: {
    color: '#1E1E1E',
    fontSize: 16,
    fontWeight: '700',
  },
  botonOmitir: {
    marginTop: 14,
    paddingVertical: 8,
  },
  botonOmitirTexto: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
});
