import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

type ProductoTipo = {
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
};

function Producto() {
  const { id } = useParams<{ id: string }>();
  const [producto, setProducto] = useState<ProductoTipo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarProducto();
    setCantidad(1);
  }, [id]);

  const cargarProducto = async () => {
    setCargando(true);
    try {
      const respuesta = await api.get(`/productos/${id}`);
      setProducto(respuesta.data);
    } catch (error) {
      console.error(error);
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
    try {
      await api.post('/carrito/items', {
        producto_id: producto.id,
        cantidad,
      });
      setMensaje(`${producto.nombre} se agregó al carrito`);
      setTimeout(() => setMensaje(''), 3000);
    } catch (error: any) {
      setMensaje(error.response?.data?.error || 'No se pudo agregar al carrito');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  if (cargando) {
    return (
      <div>
        <Header />
        <p style={estilos.textoVacio}>Cargando producto...</p>
        <Footer />
      </div>
    );
  }

  if (!producto) {
    return (
      <div>
        <Header />
        <p style={estilos.textoVacio}>No se encontró el producto</p>
        <Footer />
      </div>
    );
  }

  const subtotal = Number(producto.precio) * cantidad;

  return (
    <div>
      <Header />

      <div style={estilos.contenedor}>
        <Link to={`/categorias/${producto.categoria_id}`} style={estilos.volver}>
          ← Volver
        </Link>

        {mensaje ? <div style={estilos.aviso}>{mensaje}</div> : null}

        <div style={estilos.grillaPrincipal}>
          <div style={estilos.imagenBox}>
            <span style={estilos.imagenEmoji}>🍾</span>
          </div>

          <div>
            <div style={estilos.tagEnvio}>Envío en 24/48hs</div>

            {producto.categoria_nombre ? (
              <div style={estilos.categoriaChip}>{producto.categoria_nombre}</div>
            ) : null}

            <h1 style={estilos.nombre}>{producto.nombre}</h1>
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
            <p style={estilos.precioSubtexto}>Precio en efectivo o transferencia</p>

            <div style={estilos.detallesCard}>
              {producto.volumen_ml ? (
                <div style={estilos.detalleFila}>
                  <span style={estilos.detalleLabel}>Volumen</span>
                  <span style={estilos.detalleValor}>{producto.volumen_ml} ml</span>
                </div>
              ) : null}
              {producto.graduacion_alcoholica ? (
                <div style={estilos.detalleFila}>
                  <span style={estilos.detalleLabel}>Graduación alcohólica</span>
                  <span style={estilos.detalleValor}>
                    {producto.graduacion_alcoholica}°
                  </span>
                </div>
              ) : null}
              <div style={estilos.detalleFila}>
                <span style={estilos.detalleLabel}>Stock disponible</span>
                <span style={estilos.detalleValor}>
                  {producto.stock > 0 ? `${producto.stock} unidades` : 'Sin stock'}
                </span>
              </div>
            </div>

            <div style={estilos.selectorFila}>
              <div style={estilos.selectorCantidad}>
                <button
                  style={estilos.botonCantidad}
                  onClick={() => cambiarCantidad(-1)}
                >
                  −
                </button>
                <span style={estilos.cantidadTexto}>{cantidad}</span>
                <button
                  style={estilos.botonCantidad}
                  onClick={() => cambiarCantidad(1)}
                >
                  +
                </button>
              </div>
              <span style={estilos.subtotal}>
                Subtotal: ${subtotal.toLocaleString('es-AR')}
              </span>
            </div>

            <button
              style={{
                ...estilos.botonAgregar,
                ...(producto.stock === 0 ? estilos.botonDeshabilitado : {}),
              }}
              onClick={agregarAlCarrito}
              disabled={producto.stock === 0}
            >
              {producto.stock === 0 ? 'Sin stock' : '+ Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const estilos: Record<string, React.CSSProperties> = {
  contenedor: {
    maxWidth: 1100,
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
  aviso: {
    backgroundColor: '#2B2B2B',
    border: '1px solid #F2C229',
    color: '#F2C229',
    padding: '12px 16px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 20,
  },
  textoVacio: {
    color: '#9ca3af',
    fontSize: 15,
    padding: '60px 24px',
    textAlign: 'center',
  },
  grillaPrincipal: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
    gap: 40,
  },
  imagenBox: {
    width: '100%',
    height: 380,
    borderRadius: 20,
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagenEmoji: {
    fontSize: 110,
  },
  tagEnvio: {
    display: 'inline-block',
    backgroundColor: '#F2C229',
    color: '#1E1E1E',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 8,
    marginBottom: 12,
  },
  categoriaChip: {
    display: 'inline-block',
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 8,
    marginLeft: 8,
  },
  nombre: {
    color: '#FFF8E0',
    fontSize: 30,
    fontWeight: 800,
    margin: '12px 0 8px 0',
  },
  descripcion: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 1.6,
    margin: '0 0 16px 0',
  },
  precioFila: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  precioAnterior: {
    color: '#6b7280',
    fontSize: 16,
    textDecoration: 'line-through',
  },
  precio: {
    color: '#F2C229',
    fontSize: 30,
    fontWeight: 800,
  },
  precioSubtexto: {
    color: '#6b7280',
    fontSize: 12,
    margin: '0 0 20px 0',
  },
  detallesCard: {
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  detalleFila: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
  },
  detalleLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  detalleValor: {
    color: '#FFF8E0',
    fontSize: 14,
    fontWeight: 600,
  },
  selectorFila: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  selectorCantidad: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    borderRadius: 14,
    padding: '6px 8px',
  },
  botonCantidad: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E1E1E',
    color: '#FFF8E0',
    fontSize: 18,
    fontWeight: 700,
  },
  cantidadTexto: {
    color: '#FFF8E0',
    fontSize: 16,
    fontWeight: 700,
    margin: '0 20px',
    minWidth: 16,
    textAlign: 'center',
  },
  subtotal: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: 600,
  },
  botonAgregar: {
    width: '100%',
    backgroundColor: '#F2C229',
    color: '#1E1E1E',
    fontWeight: 700,
    fontSize: 15,
    padding: '16px 0',
    borderRadius: 14,
  },
  botonDeshabilitado: {
    backgroundColor: '#3a3a3a',
  },
};

export default Producto;