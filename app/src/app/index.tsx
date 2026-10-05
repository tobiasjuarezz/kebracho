import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api from '../services/api';
import { autenticarConFaceId } from '../utils/biometria';
import LeyendaLegal from '../components/leyenda-legal';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  useEffect(() => {
    verificarSesionGuardada();
  }, []);

  const verificarSesionGuardada = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const faceIdActivado = await AsyncStorage.getItem('faceIdActivado');

      const faceIdConfigurado = await AsyncStorage.getItem('faceIdConfigurado');

      if (token && faceIdActivado === 'true') {
        // Tiene Face ID: se lo pedimos para entrar
        const exito = await autenticarConFaceId('Ingresá con Face ID a Kebracho');
        if (exito) {
          router.replace('/explore');
          return;
        }
      } else if (token && faceIdConfigurado === 'true') {
        // Ya tiene sesión y eligió no usar Face ID: entra directo
        router.replace('/explore');
        return;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setVerificandoSesion(false);
    }
  };

  const irSegunFaceId = async () => {
    const faceIdConfigurado = await AsyncStorage.getItem('faceIdConfigurado');
    if (faceIdConfigurado !== 'true') {
      router.replace('/activar-faceid');
    } else {
      router.replace('/explore');
    }
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!email || !password) {
      Alert.alert('Error', 'Completá email y contraseña');
      return;
    }
    setCargando(true);
    try {
      const respuesta = await api.post('/usuarios/login', { email: email.trim(), password });
      await AsyncStorage.setItem('token', respuesta.data.token);
      await AsyncStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
      await irSegunFaceId();
    } catch (error: any) {
      const mensaje = error.response?.data?.error || 'No se pudo conectar con el servidor';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  if (verificandoSesion) {
    return (
      <View style={styles.contenedorCentro}>
        <ActivityIndicator color="#F2C229" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Image
        source={require('../../assets/images/isologo.png')}
        style={styles.isologo}
        resizeMode="contain"
        accessibilityLabel="Kebracho"
      />
      <Text style={styles.subtitulo}>Para la previa, a un toque</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#6b7280"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#6b7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity style={styles.boton} onPress={handleLogin} disabled={cargando}>
          <Text style={styles.botonTexto}>{cargando ? 'Ingresando...' : 'Ingresar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/registro')} style={styles.linkBox}>
          <Text style={styles.linkTexto}>
            ¿No tenés cuenta? <Text style={styles.linkTextoBold}>Registrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
      <LeyendaLegal style={styles.leyenda} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  contenedorCentro: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  isologo: {
    width: 260,
    height: 48,
    marginBottom: 8,
  },
  leyenda: {
    marginTop: 20,
  },
  subtitulo: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 32,
  },
  card: {
    width: '100%',
    backgroundColor: '#2B2B2B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    padding: 20,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 14,
    padding: 14,
    color: '#FFF8E0',
    fontSize: 14,
    marginBottom: 14,
  },
  boton: {
    backgroundColor: '#F2C229',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  botonTexto: {
    color: '#1E1E1E',
    fontSize: 16,
    fontWeight: '700',
  },
  linkBox: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkTexto: {
    color: '#9ca3af',
    fontSize: 13,
  },
  linkTextoBold: {
    color: '#F2C229',
    fontWeight: '700',
  },
});