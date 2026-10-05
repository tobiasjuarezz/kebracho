import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section style={estilos.seccion}>
      <div style={estilos.contenedor}>
        <div style={estilos.tag}>🚚 Envíos en 24/48hs a todo el país</div>
        <h1 style={estilos.titulo}>
          Las mejores bebidas,
          <br />
          <span style={estilos.tituloDestacado}>al mejor precio</span>
        </h1>
        <p style={estilos.bajada}>
          Cervezas, vinos, whisky y mucho más. Comprá online y recibilo en tu
          casa, con la mejor selección premium.
        </p>
        <div style={estilos.botones}>
          <Link to="/categorias" style={estilos.botonPrimario}>
            Ver catálogo
          </Link>
          <a href="#categorias" style={estilos.botonSecundario}>
            Explorar categorías
          </a>
        </div>
      </div>
    </section>
  );
}

const estilos: Record<string, React.CSSProperties> = {
  seccion: {
    background: 'linear-gradient(180deg, #1E1E1E 0%, #2B2B2B 100%)',
    borderBottom: '1px solid #3D3D3D',
    padding: '80px 24px',
  },
  contenedor: {
    maxWidth: 900,
    margin: '0 auto',
    textAlign: 'center',
  },
  tag: {
    display: 'inline-block',
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    color: '#F2C229',
    fontSize: 13,
    fontWeight: 700,
    padding: '8px 16px',
    borderRadius: 20,
    marginBottom: 24,
  },
  titulo: {
    color: '#FFF8E0',
    fontSize: 48,
    fontWeight: 800,
    lineHeight: 1.15,
    margin: '0 0 20px 0',
  },
  tituloDestacado: {
    color: '#F2C229',
  },
  bajada: {
    color: '#9ca3af',
    fontSize: 17,
    lineHeight: 1.6,
    maxWidth: 560,
    margin: '0 auto 32px auto',
  },
  botones: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  botonPrimario: {
    backgroundColor: '#F2C229',
    color: '#1E1E1E',
    fontWeight: 700,
    fontSize: 15,
    padding: '14px 28px',
    borderRadius: 14,
  },
  botonSecundario: {
    backgroundColor: 'transparent',
    color: '#FFF8E0',
    fontWeight: 700,
    fontSize: 15,
    padding: '14px 28px',
    borderRadius: 14,
    border: '1px solid #3D3D3D',
  },
};

export default Hero;