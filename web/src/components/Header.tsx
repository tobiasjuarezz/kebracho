import { Link, useNavigate } from 'react-router-dom';
import { cerrarSesion, usuarioLogueado } from '../services/api';

function Header() {
  const usuario = usuarioLogueado();
  const navigate = useNavigate();

  const salir = () => {
    cerrarSesion();
    navigate('/');
  };

  return (
    <header style={estilos.header}>
      <div style={estilos.contenedor}>
        <Link to="/" style={estilos.logoContenedor}>
          <img src="/isologo.png" alt="Kebracho" style={{ height: 34, width: 'auto' }} />
        </Link>

        <nav style={estilos.nav}>
          <Link to="/" style={estilos.navLink}>
            Inicio
          </Link>
          <Link to="/categorias" style={estilos.navLink}>
            Categorías
          </Link>
          <Link to="/nosotros" style={estilos.navLink}>
            Nosotros
          </Link>
          <Link to="/contacto" style={estilos.navLink}>
            Contacto
          </Link>
        </nav>

        <div style={estilos.acciones}>
          {usuario ? (
            <>
              <span style={{ color: '#9ca3af', fontSize: 14 }}>Hola, {usuario.nombre}</span>
              <button onClick={salir} style={{ ...estilos.botonSecundario, background: 'transparent' }}>
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" style={estilos.botonSecundario}>
              Ingresar
            </Link>
          )}
          <Link to="/carrito" style={estilos.botonCarrito}>
            🛒
          </Link>
        </div>
      </div>
    </header>
  );
}

const estilos: Record<string, React.CSSProperties> = {
  header: {
    backgroundColor: '#1E1E1E',
    borderBottom: '1px solid #3D3D3D',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  contenedor: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
  },
  logoContenedor: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F2C229',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTexto: {
    color: '#1E1E1E',
    fontWeight: 800,
    fontSize: 18,
  },
  marca: {
    color: '#FFF8E0',
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: 1,
  },
  nav: {
    display: 'flex',
    gap: 28,
  },
  navLink: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 600,
  },
  acciones: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  botonSecundario: {
    color: '#F2C229',
    fontSize: 14,
    fontWeight: 700,
    border: '1px solid #F2C229',
    borderRadius: 10,
    padding: '8px 16px',
  },
  botonCarrito: {
    fontSize: 18,
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    borderRadius: 10,
    width: 38,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default Header;