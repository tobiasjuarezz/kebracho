
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api from '../services/api';
import LeyendaLegal from '../components/leyenda-legal';

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [cargando, setCargando] = useState(false);

  const formatearFecha = (texto: string) => {
    const soloNumeros = texto.replace(/\D/g, '').slice(0, 8);

    let resultado = soloNumeros;
    if (soloNumeros.length > 4) {
      resultado = soloNumeros.slice(0, 4) + '/' + soloNumeros.slice(4);
    }
    if (soloNumeros.length > 6) {
      resultado =
        soloNumeros.slice(0, 4) +
        '/' +
        soloNumeros.slice(4, 6) +
        '/' +
        soloNumeros.slice(6);
    }

    setFechaNacimiento(resultado);
  };

  const handleRegistro = async () => {
    Keyboard.dismiss();
    if (!nombre || !apellido || !email || !password || !fechaNacimiento) {
      Alert.alert('Error', 'Completá todos los campos');
      return;
    }

    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(fechaNacimiento)) {
      Alert.alert('Error', 'Ingresá la fecha completa (AAAA/MM/DD)');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña tiene que tener al menos 6 caracteres');
      return;
    }

    const fechaParaBackend = fechaNacimiento.replace(/\//g, '-');

    setCargando(true);
    try {
      const respuesta = await api.post('/usuarios/registro', {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        password,
        fecha_nacimiento: fechaParaBackend,
      });
      await AsyncStorage.setItem('token', respuesta.data.token);
      await AsyncStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
      Alert.alert('¡Listo!', 'Tu cuenta fue creada correctamente', [
        { text: 'Continuar', onPress: () => router.replace('/activar-faceid') },
      ]);
    } catch (error: any) {
      const mensaje = error.response?.data?.error || 'No se pudo completar el registro';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor} style={{ backgroundColor: '#1E1E1E' }}>
      <Text style={styles.titulo}>Crear cuenta</Text>
      <Text style={styles.subtitulo}>Tenés que ser mayor de 18 años</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#6b7280"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Apellido"
          placeholderTextColor="#6b7280"
          value={apellido}
          onChangeText={setApellido}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#6b7280"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña (mínimo 6 caracteres)"
          placeholderTextColor="#6b7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Fecha de nacimiento (AAAA/MM/DD)"
          placeholderTextColor="#6b7280"
          value={fechaNacimiento}
          onChangeText={formatearFecha}
          keyboardType="numeric"
          maxLength={10}
        />

        <TouchableOpacity style={styles.boton} onPress={handleRegistro} disabled={cargando}>
          <Text style={styles.botonTexto}>{cargando ? 'Creando cuenta...' : 'Crear cuenta'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.linkBox}>
          <Text style={styles.linkTexto}>
            ¿Ya tenés cuenta? <Text style={styles.linkTextoBold}>Ingresá</Text>
          </Text>
        </TouchableOpacity>
      </View>
      <LeyendaLegal style={{ marginTop: 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF8E0',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#2B2B2B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#FFF8E0',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  boton: {
    backgroundColor: '#F2C229',
    padding: 16,
    borderRadius: 12,
    marginTop: 6,
  },
  botonTexto: {
    color: '#1E1E1E',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  linkBox: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkTexto: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  linkTextoBold: {
    color: '#F2C229',
    fontWeight: 'bold',
  },
});