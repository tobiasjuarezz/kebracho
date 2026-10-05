import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_anterior: number | null;
  categoria_nombre?: string;
};

function ProductosDestacados() {
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    api
      .get('/productos')
      .then((respuesta) => setProductos(respuesta.data.slice(0, 4)))
      .catch((error) => console.error(error));
  }, []);

  return (
    <section style={estilos.seccion}>
      <div style={estilos.contenedor}>
        <div style={estilos.encabezado}>
          <div>
            <h2 style={estilos.titulo}>Productos destacados</h2>
            <p style={estilos.subtitulo}>Los preferidos de nuestros clientes</p>
          </div>
          <Link to="/categorias" style={estilos.verTodos}>
            Ver todos →
          </Link>
        </div>

        <div style={estilos.grilla}>
          {productos.map((producto) => (
            <div key={producto.id} style={estilos.card}>
              <div style={estilos.tagEnvio}>Envío en 24/48hs</div>

              <div style={estilos.imagenBox}>
                <span style={estilos.imagenEmoji}>🍾</span>
              </div>

              {producto.categoria_nombre ? (
                <div style={estilos.categoriaChip}>
                  {producto.categoria_nombre}
                </div>
              ) : null}

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

              <Link to={`/producto/${producto.id}`} style={estilos.botonVer}>
                Ver producto
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const estilos: Record<string, React.CSSProperties> = {
  seccion: {
    padding: '40px 24px 80px 24px',
  },
  contenedor: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  encabezado: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  titulo: {
    color: '#FFF8E0',
    fontSize: 28,
    fontWeight: 800,
    margin: '0 0 8px 0',
  },
  subtitulo: {
    color: '#9ca3af',
    fontSize: 15,
    margin: 0,
  },
  verTodos: {
    color: '#F2C229',
    fontSize: 14,
    fontWeight: 700,
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
  categoriaChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E1E1E',
    border: '1px solid #3D3D3D',
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 8,
    marginBottom: 8,
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
    minHeight: 34,
  },
  precioFila: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
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
  botonVer: {
    textAlign: 'center',
    border: '1px solid #F2C229',
    color: '#F2C229',
    fontWeight: 700,
    fontSize: 14,
    padding: '10px 0',
    borderRadius: 12,
    marginTop: 'auto',
  },
};

export default ProductosDestacados;