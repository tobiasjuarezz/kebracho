import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

type Categoria = {
  id: number;
  nombre: string;
};

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

function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    api
      .get('/categorias')
      .then((respuesta) => setCategorias(respuesta.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <section id="categorias" style={estilos.seccion}>
      <div style={estilos.contenedor}>
        <h2 style={estilos.titulo}>Comprá por categoría</h2>
        <p style={estilos.subtitulo}>
          Encontrá lo que buscás entre nuestras categorías
        </p>

        <div style={estilos.grilla}>
          {categorias.map((categoria) => (
            <Link
              key={categoria.id}
              to={`/categorias/${categoria.id}`}
              style={estilos.card}
            >
              <div style={estilos.iconoBox}>
                <span style={estilos.icono}>
                  {iconos[categoria.nombre.trim()] || '🍾'}
                </span>
              </div>
              <span style={estilos.nombre}>{categoria.nombre}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const estilos: Record<string, React.CSSProperties> = {
  seccion: {
    padding: '64px 24px',
  },
  contenedor: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  titulo: {
    color: '#FFF8E0',
    fontSize: 28,
    fontWeight: 800,
    textAlign: 'center',
    margin: '0 0 8px 0',
  },
  subtitulo: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
    margin: '0 0 40px 0',
  },
  grilla: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 16,
  },
  card: {
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    borderRadius: 16,
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    transition: 'transform 0.15s ease, border-color 0.15s ease',
  },
  iconoBox: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: '#1E1E1E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icono: {
    fontSize: 26,
  },
  nombre: {
    color: '#FFF8E0',
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
  },
};

export default Categorias;