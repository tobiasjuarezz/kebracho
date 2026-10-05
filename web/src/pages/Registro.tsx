import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre || !apellido || !email || !password || !fechaNacimiento) {
      setError('Completá todos los campos');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
      setError('Elegí tu fecha de nacimiento');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña tiene que tener al menos 6 caracteres');
      return;
    }

    setCargando(true);
    try {
      const respuesta = await api.post('/usuarios/registro', {
        nombre,
        apellido,
        email,
        password,
        fecha_nacimiento: fechaNacimiento,
      });
      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo completar el registro');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={estilos.contenedor}>
      <Link to="/" style={estilos.logoContenedor}>
        <img src="/isologo.png" alt="Kebracho" style={{ height: 40, width: 'auto' }} />
      </Link>

      <div style={estilos.card}>
        <h1 style={estilos.titulo}>Creá tu cuenta</h1>
        <p style={estilos.subtitulo}>Tenés que ser mayor de 18 años</p>

        <form onSubmit={handleSubmit} style={estilos.form}>
          <div style={estilos.fila}>
            <input
              style={estilos.input}
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <input
              style={estilos.input}
              placeholder="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />
          </div>
          <input
            style={estilos.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={estilos.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            style={estilos.input}
            type="date"
            title="Fecha de nacimiento"
            placeholder="Fecha de nacimiento"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
          />

          {error ? <p style={estilos.error}>{error}</p> : null}

          <button style={estilos.boton} type="submit" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={estilos.link}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={estilos.linkDestacado}>
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  );
}

const estilos: Record<string, React.CSSProperties> = {
  contenedor: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 32,
  },
  logoContenedor: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F2C229',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTexto: {
    color: '#1E1E1E',
    fontWeight: 800,
    fontSize: 20,
  },
  marca: {
    color: '#FFF8E0',
    fontWeight: 800,
    fontSize: 22,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 420,
  },
  titulo: {
    color: '#FFF8E0',
    fontSize: 22,
    fontWeight: 800,
    margin: '0 0 6px 0',
    textAlign: 'center',
  },
  subtitulo: {
    color: '#9ca3af',
    fontSize: 14,
    margin: '0 0 24px 0',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  fila: {
    display: 'flex',
    gap: 12,
  },
  input: {
    backgroundColor: '#1E1E1E',
    border: '1px solid #3D3D3D',
    borderRadius: 12,
    padding: '14px 16px',
    color: '#FFF8E0',
    fontSize: 14,
    flex: 1,
    minWidth: 0,
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
    margin: 0,
  },
  boton: {
    backgroundColor: '#F2C229',
    color: '#1E1E1E',
    fontWeight: 700,
    fontSize: 15,
    padding: '14px 0',
    borderRadius: 12,
    marginTop: 6,
  },
  link: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  linkDestacado: {
    color: '#F2C229',
    fontWeight: 700,
  },
};

export default Registro;