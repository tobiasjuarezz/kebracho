import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_anterior: number | null;
  categoria_id: number;
  categoria_nombre?: string;
};

type Categoria = {
  id: number;
  nombre: string;
};

function Catalogo() {
  const { id } = useParams<{ id: string }>();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [respuestaCategorias, respuestaProductos] = await Promise.all([
        api.get('/categorias'),
        api.get('/productos'),
      ]);

      const categoriaActual = respuestaCategorias.data.find(
        (c: Categoria) => c.id === Number(id)
      );
      setCategoria(categoriaActual || null);

      const filtrados = respuestaProductos.data.filter(
        (p: Producto) => p.categoria_id === Number(id)
      );
      setProductos(filtrados);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const agregarAlCarrito = async (producto: Producto) => {
    try {
      await api.post('/carrito/items', { producto_id: producto.id, cantidad: 1 });
      setMensaje(`${producto.nombre} se agregó al carrito`);
      setTimeout(() => setMensaje(''), 2500);
    } catch (error: any) {
      setMensaje(error.response?.data?.error || 'No se pudo agregar al carrito');
      setTimeout(() => setMensaje(''), 2500);
    }
  };

  return (
    <div>
      <Header />

      <div style={estilos.contenedor}>
        <Link to="/" style={estilos.volver}>
          ← Volver al inicio
        </Link>

        <h1 style={estilos.titulo}>{categoria?.nombre || 'Categoría'}</h1>
        <p style={estilos.subtitulo}>
          {productos.length} producto{productos.length !== 1 ? 's' : ''} disponible
          {productos.length !== 1 ? 's' : ''}
        </p>

        {mensaje ? <div style={estilos.aviso}>{mensaje}</div> : null}

        {cargando ? (
          <p style={estilos.textoVacio}>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p style={estilos.textoVacio}>
            Todavía no hay productos en esta categoría
          </p>
        ) : (
          <div style={estilos.grilla}>
            {productos.map((producto) => (
              <div key={producto.id} style={estilos.card}>
                <div style={estilos.tagEnvio}>Envío en 24/48hs</div>

                <div style={estilos.imagenBox}>
                  <span style={estilos.imagenEmoji}>🍾</span>
                </div>

                <h3 style={estilos.nombre}>{producto.nombre}</h3>
                <p style={estilos.descripcion}>{producto.descripcion}</p>

                <div style={estilos.precioFila}>
                  {producto.precio_anterior ? (
                    <span style={estilos.precioAnterior}>
                      ${Number(producto.precio_anterior).toLocaleString('es-AR')}
                    </span>
                  ) : null}
                  <span style={estilos.precio}>
                    ${Number(producto.precio).toLocaleString('es-AR')}
                  </span>
                </div>
                <p style={estilos.precioSubtexto}>
                  Precio en efectivo o transferencia
                </p>

                <Link to={`/producto/${producto.id}`} style={estilos.botonVer}>
                  Ver producto
                </Link>
                <button
                  style={estilos.botonAgregar}
                  onClick={() => agregarAlCarrito(producto)}
                >
                  + Agregar al carrito
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

const estilos: Record<string, React.CSSProperties> = {
  contenedor: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '32px 24px 64px 24px',
    minHeight: '50vh',
  },
  volver: {
    color: '#F2C229',
    fontSize: 14,
    fontWeight: 600,
    display: 'inline-block',
    marginBottom: 20,
  },
  titulo: {
    color: '#FFF8E0',
    fontSize: 32,
    fontWeight: 800,
    margin: '0 0 6px 0',
  },
  subtitulo: {
    color: '#9ca3af',
    fontSize: 14,
    margin: '0 0 24px 0',
  },
  aviso: {
    backgroundColor: '#2B2B2B',
    border: '1px solid #F2C229',
    color: '#F2C229',
    padding: '12px 16px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 24,
  },
  textoVacio: {
    color: '#9ca3af',
    fontSize: 15,
    padding: '40px 0',
    textAlign: 'center',
  },
  grilla: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 20,
  },
  card: {
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    borderRadius: 20,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  tagEnvio: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2C229',
    color: '#1E1E1E',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 8,
    marginBottom: 12,
  },
  imagenBox: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  imagenEmoji: {
    fontSize: 56,
  },
  nombre: {
    color: '#FFF8E0',
    fontSize: 16,
    fontWeight: 700,
    margin: '0 0 4px 0',
  },
  descripcion: {
    color: '#9ca3af',
    fontSize: 13,
    margin: '0 0 12px 0',
  },
  precioFila: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  precioAnterior: {
    color: '#6b7280',
    fontSize: 14,
    textDecoration: 'line-through',
  },
  precio: {
    color: '#F2C229',
    fontSize: 20,
    fontWeight: 800,
  },
  precioSubtexto: {
    color: '#6b7280',
    fontSize: 11,
    margin: '0 0 14px 0',
  },
  botonVer: {
    textAlign: 'center',
    border: '1px solid #F2C229',
    color: '#F2C229',
    fontWeight: 700,
    fontSize: 14,
    padding: '10px 0',
    borderRadius: 12,
    marginBottom: 8,
  },
  botonAgregar: {
    backgroundColor: '#F2C229',
    color: '#1E1E1E',
    fontWeight: 700,
    fontSize: 14,
    padding: '10px 0',
    borderRadius: 12,
  },
};

export default Catalogo;