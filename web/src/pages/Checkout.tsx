import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function Checkout() {
  const [carrito, setCarrito] = useState<CarritoTipo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [direccion, setDireccion] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<number | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    cargarCarrito();
  }, []);

  const cargarCarrito = async () => {
    try {
      const respuesta = await api.get('/carrito');
      setCarrito(respuesta.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const total =
    carrito?.items.reduce((acc, item) => acc + Number(item.precio) * item.cantidad, 0) ?? 0;

  const confirmarPedido = async () => {
    setError('');
    if (!direccion.trim()) {
      setError('Ingresá dónde querés recibir el pedido');
      return;
    }
    setConfirmando(true);
    try {
      const respuesta = await api.post('/pedidos', {
        direccion_entrega: direccion.trim(),
      });
      setPedidoConfirmado(respuesta.data.id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo confirmar el pedido');
    } finally {
      setConfirmando(false);
    }
  };

  if (pedidoConfirmado) {
    return (
      <div>
        <Header />
        <div style={estilos.confirmacionContenedor}>
          <span style={estilos.confirmacionEmoji}>✅</span>
          <h1 style={estilos.confirmacionTitulo}>¡Pedido confirmado!</h1>
          <p style={estilos.confirmacionTexto}>
            Tu pedido #{pedidoConfirmado} fue registrado. Te contactamos para
            coordinar el pago y la entrega.
          </p>
          <button style={estilos.botonVolver} onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />

      <div style={estilos.contenedor}>
        <h1 style={estilos.titulo}>Confirmar pedido</h1>

        {cargando ? (
          <p style={estilos.textoVacio}>Cargando...</p>
        ) : !carrito || carrito.items.length === 0 ? (
          <p style={estilos.textoVacio}>Tu carrito está vacío</p>
        ) : (
          <div style={estilos.layout}>
            <div>
              <h2 style={estilos.seccionTitulo}>Resumen</h2>
              <div style={estilos.resumenCard}>
                {carrito.items.map((item) => (
                  <div key={item.id} style={estilos.resumenFila}>
                    <span style={estilos.resumenNombre}>
                      {item.cantidad}x {item.nombre}
                    </span>
                    <span style={estilos.resumenPrecio}>
                      ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
                <div style={estilos.divisor} />
                <div style={estilos.resumenFila}>
                  <span style={estilos.totalLabel}>Total</span>
                  <span style={estilos.totalMonto}>
                    ${total.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 style={estilos.seccionTitulo}>Dirección de entrega</h2>
              <textarea
                style={estilos.textarea}
                placeholder="Calle, número, localidad"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />

              {error ? <p style={estilos.error}>{error}</p> : null}

              <p style={estilos.aviso}>
                El pago se coordina por WhatsApp una vez confirmado el pedido
                (efectivo o transferencia).
              </p>

              <button
                style={estilos.botonConfirmar}
                onClick={confirmarPedido}
                disabled={confirmando}
              >
                {confirmando ? 'Confirmando...' : 'Confirmar pedido'}
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
    maxWidth: 1000,
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
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: 32,
  },
  seccionTitulo: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    margin: '0 0 14px 0',
  },
  resumenCard: {
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    borderRadius: 16,
    padding: 20,
  },
  resumenFila: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resumenNombre: {
    color: '#FFF8E0',
    fontSize: 14,
  },
  resumenPrecio: {
    color: '#FFF8E0',
    fontSize: 14,
    fontWeight: 600,
  },
  divisor: {
    height: 1,
    backgroundColor: '#3D3D3D',
    margin: '8px 0',
  },
  totalLabel: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: 700,
  },
  totalMonto: {
    color: '#F2C229',
    fontSize: 18,
    fontWeight: 800,
  },
  textarea: {
    width: '100%',
    minHeight: 90,
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    borderRadius: 14,
    padding: 14,
    color: '#FFF8E0',
    fontSize: 14,
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: 12,
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
  },
  aviso: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 20,
  },
  botonConfirmar: {
    width: '100%',
    backgroundColor: '#F2C229',
    color: '#1E1E1E',
    fontWeight: 700,
    fontSize: 15,
    padding: '16px 0',
    borderRadius: 14,
  },
  confirmacionContenedor: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: 24,
    textAlign: 'center',
  },
  confirmacionEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  confirmacionTitulo: {
    color: '#FFF8E0',
    fontSize: 24,
    fontWeight: 800,
    margin: '0 0 10px 0',
  },
  confirmacionTexto: {
    color: '#9ca3af',
    fontSize: 15,
    maxWidth: 420,
    marginBottom: 24,
  },
  botonVolver: {
    backgroundColor: '#F2C229',
    color: '#1E1E1E',
    fontWeight: 700,
    fontSize: 14,
    padding: '12px 28px',
    borderRadius: 12,
  },
};

export default Checkout;