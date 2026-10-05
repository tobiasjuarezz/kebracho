import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Completá email y contraseña');
      return;
    }
    setCargando(true);
    try {
      const respuesta = await api.post('/usuarios/login', { email, password });
      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo conectar con el servidor');
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
        <h1 style={estilos.titulo}>Ingresá a tu cuenta</h1>
        <p style={estilos.subtitulo}>Para la previa, a un click</p>

        <form onSubmit={handleSubmit} style={estilos.form}>
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

          {error ? <p style={estilos.error}>{error}</p> : null}

          <button style={estilos.boton} type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={estilos.link}>
          ¿No tenés cuenta?{' '}
          <Link to="/registro" style={estilos.linkDestacado}>
            Registrate
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
    maxWidth: 380,
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
  input: {
    backgroundColor: '#1E1E1E',
    border: '1px solid #3D3D3D',
    borderRadius: 12,
    padding: '14px 16px',
    color: '#FFF8E0',
    fontSize: 14,
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

export default Login;