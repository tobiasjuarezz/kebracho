import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api, { cerrarSesion } from '../services/api';
import LeyendaLegal from '../components/leyenda-legal';

const iconos: Record<string, string> = {
  Cervezas: '🍺',
  Vinos: '🍷',
  Whisky: '🥃',
  Gin: '🍸',
  Espumantes: '🥂',
  Licores: '🍹',
  Vodka: '🍶',
  Ron: '🥃',
  Tequila: '🍹',
  Packs: '📦',
};

type Categoria = {
  id: number;
  nombre: string;
};

export default function HomeScreen() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombreUsuario, setNombreUsuario] = useState('');

  useEffect(() => {
    cargarCategorias();
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    try {
      const guardado = await AsyncStorage.getItem('usuario');
      if (guardado) setNombreUsuario(JSON.parse(guardado).nombre || '');
    } catch {
      // si no se puede leer, simplemente no mostramos el nombre
    }
  };

  const salir = () => {
    Alert.alert('Cerrar sesión', '¿Querés salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await cerrarSesion();
          await AsyncStorage.multiRemove(['faceIdActivado', 'faceIdConfigurado']);
          router.replace('/');
        },
      },
    ]);
  };

  const cargarCategorias = async () => {
    try {
      const respuesta = await api.get('/categorias');
      setCategorias(respuesta.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar las categorías. Revisá que el backend esté prendido.');
    } finally {
      setCargando(false);
    }
  };

  const irAProductos = (categoria: Categoria) => {
    router.push({
      pathname: '/productos',
      params: { categoriaId: categoria.id, nombre: categoria.nombre },
    });
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#F2C229" />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.headerFila}>
        <View>
          <Text style={styles.titulo}>KEBRACHO</Text>
          <Text style={styles.subtitulo}>
            {nombreUsuario ? `Hola, ${nombreUsuario} 👋` : 'Explorá las categorías'}
          </Text>
        </View>
        <View style={styles.headerBotones}>
          <TouchableOpacity
            style={styles.headerBoton}
            onPress={() => router.push('/favoritos')}
          >
            <Text style={styles.headerBotonEmoji}>🤍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBoton}
            onPress={() => router.push('/pedidos')}
          >
            <Text style={styles.headerBotonEmoji}>🧾</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBoton}
            onPress={() => router.push('/carrito')}
          >
            <Text style={styles.headerBotonEmoji}>🛒</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBoton} onPress={salir}>
            <Text style={styles.headerBotonEmoji}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListFooterComponent={<LeyendaLegal />}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.tarjeta} onPress={() => irAProductos(item)}>
            <View style={styles.iconoCirculo}>
              <Text style={styles.iconoTexto}>{iconos[item.nombre] || '🍾'}</Text>
            </View>
            <Text style={styles.tarjetaTexto}>{item.nombre}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  centrado: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  headerBotones: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBoton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2B2B2B',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBotonEmoji: {
    fontSize: 18,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF8E0',
    letterSpacing: 2,
  },
  subtitulo: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  tarjeta: {
    flex: 1,
    backgroundColor: '#2B2B2B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  iconoCirculo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#363636',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconoTexto: {
    fontSize: 26,
  },
  tarjetaTexto: {
    color: '#FFF8E0',
    fontWeight: '600',
    fontSize: 15,
  },
});