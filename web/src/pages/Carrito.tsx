import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

type ItemCarrito = {
  id: number;
  producto_id: number;
  cantidad: number;
  nombre: string;
  precio: number;
};

type CarritoTipo = {
  id: number;
  items: ItemCarrito[];
};

function Carrito() {
  const [carrito, setCarrito] = useState<CarritoTipo | null>(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarCarrito();
  }, []);

  const cargarCarrito = async () => {
    try {
      const respuesta = await api.get('/carrito');
      setCarrito(respuesta.data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const cambiarCantidad = async (item: ItemCarrito, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) {
      eliminarItem(item.id);
      return;
    }
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
      alert(error.response?.data?.error || 'No se pudo actualizar la cantidad');
    }
  };

  const eliminarItem = async (itemId: number) => {
    try {
      await api.delete(`/carrito/items/${itemId}`);
      setCarrito((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : prev
      );
    } catch (error) {
      console.error(error);
    }
  };

  const total =
    carrito?.items.reduce((acc, item) => acc + Number(item.precio) * item.cantidad, 0) ?? 0;

  const irACheckout = () => {
    if (!carrito || carrito.items.length === 0) return;
    navigate('/checkout');
  };

  return (
    <div>
      <Header />

      <div style={estilos.contenedor}>
        <h1 style={estilos.titulo}>Tu carrito</h1>

        {cargando ? (
          <p style={estilos.textoVacio}>Cargando carrito...</p>
        ) : !carrito || carrito.items.length === 0 ? (
          <div style={estilos.vacioContenedor}>
            <span style={estilos.vacioEmoji}>🛒</span>
            <p style={estilos.vacioTexto}>Todavía no agregaste nada</p>
            <Link to="/" style={estilos.botonExplorar}>
              Ver categorías
            </Link>
          </div>
        ) : (
          <div style={estilos.layout}>
            <div style={estilos.lista}>
              {carrito.items.map((item) => (
                <div key={item.id} style={estilos.card}>
                  <div style={estilos.imagenBox}>
                    <span style={estilos.imagenEmoji}>🍾</span>
                  </div>
                  <div style={estilos.info}>
                    <span style={estilos.nombre}>{item.nombre}</span>
                    <span style={estilos.precio}>
                      ${Number(item.precio).toLocaleString('es-AR')}
                    </span>
                    <div style={estilos.controles}>
                      <button
                        style={estilos.botonCantidad}
                        onClick={() => cambiarCantidad(item, item.cantidad - 1)}
                      >
                        −
                      </button>
                      <span style={estilos.cantidad}>{item.cantidad}</span>
                      <button
                        style={estilos.botonCantidad}
                        onClick={() => cambiarCantidad(item, item.cantidad + 1)}
                      >
                        +
                      </button>
                      <button
                        style={estilos.eliminar}
                        onClick={() => eliminarItem(item.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={estilos.resumen}>
              <h2 style={estilos.resumenTitulo}>Resumen</h2>
              <div style={estilos.totalFila}>
                <span style={estilos.totalLabel}>Total</span>
                <span style={estilos.totalMonto}>
                  ${total.toLocaleString('es-AR')}
                </span>
              </div>
              <button style={estilos.botonComprar} onClick={irACheckout}>
                Finalizar compra
              </button>
            </div>
          </div>
        )}
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
  titulo: {
    color: '#FFF8E0',
    fontSize: 28,
    fontWeight: 800,
    margin: '0 0 24px 0',
  },
  textoVacio: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
    padding: '40px 0',
  },
  vacioContenedor: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    padding: '60px 0',
  },
  vacioEmoji: {
    fontSize: 56,
  },
  vacioTexto: {
    color: '#9ca3af',
    fontSize: 16,
  },
  botonExplorar: {
    backgroundColor: '#F2C229',
    color: '#1E1E1E',
    fontWeight: 700,
    fontSize: 14,
    padding: '12px 24px',
    borderRadius: 12,
    marginTop: 8,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
    gap: 24,
    alignItems: 'flex-start',
  },
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  card: {
    display: 'flex',
    gap: 14,
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    borderRadius: 16,
    padding: 14,
  },
  imagenBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  imagenEmoji: {
    fontSize: 32,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  nombre: {
    color: '#FFF8E0',
    fontSize: 15,
    fontWeight: 700,
  },
  precio: {
    color: '#F2C229',
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 6,
  },
  controles: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  botonCantidad: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    color: '#FFF8E0',
    fontSize: 15,
    fontWeight: 700,
  },
  cantidad: {
    color: '#FFF8E0',
    fontSize: 14,
    fontWeight: 600,
    minWidth: 16,
    textAlign: 'center',
  },
  eliminar: {
    marginLeft: 'auto',
    backgroundColor: 'transparent',
    color: '#ef4444',
    fontSize: 13,
    fontWeight: 600,
  },
  resumen: {
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    borderRadius: 16,
    padding: 20,
    position: 'sticky',
    top: 90,
  },
  resumenTitulo: {
    color: '#FFF8E0',
    fontSize: 16,
    fontWeight: 700,
    margin: '0 0 16px 0',
  },
  totalFila: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: '1px solid #3D3D3D',
  },
  totalLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  totalMonto: {
    color: '#FFF8E0',
    fontSize: 20,
    fontWeight: 800,
  },
  botonComprar: {
    width: '100%',
    backgroundColor: '#F2C229',
    color: '#1E1E1E',
    fontWeight: 700,
    fontSize: 15,
    padding: '14px 0',
    borderRadius: 12,
  },
};

export default Carrito;