import { Link } from 'react-router-dom';

function Footer() {
  const categorias = [
    'Cervezas',
    'Vinos',
    'Whisky',
    'Gin',
    'Espumantes',
    'Vodka',
  ];

  return (
    <footer style={estilos.footer}>
      <div style={estilos.contenedor}>
        <div style={estilos.columnas}>
          <div style={estilos.columna}>
            <div style={estilos.marca}>
              <img src="/isologo.png" alt="Kebracho" style={{ height: 32, width: 'auto' }} />
            </div>
            <p style={estilos.descripcion}>
              Bebidas para la previa y la juntada con amigos. Pedí en un click
              y coordinamos la entrega en Zona Sur.
            </p>
            <p style={estilos.advertencia}>
              Prohibida su venta a menores de 18 años. Beber con moderación.
            </p>
          </div>

          <div style={estilos.columna}>
            <h4 style={estilos.tituloColumna}>Categorías</h4>
            {categorias.map((categoria) => (
              <Link key={categoria} to="/categorias" style={estilos.link}>
                {categoria}
              </Link>
            ))}
          </div>

          <div style={estilos.columna}>
            <h4 style={estilos.tituloColumna}>Ayuda</h4>
            <Link to="/nosotros" style={estilos.link}>
              Sobre nosotros
            </Link>
            <Link to="/contacto" style={estilos.link}>
              Contacto
            </Link>
            <Link to="/terminos" style={estilos.link}>
              Términos y condiciones
            </Link>
            <Link to="/privacidad" style={estilos.link}>
              Política de privacidad
            </Link>
          </div>

          <div style={estilos.columna}>
            <h4 style={estilos.tituloColumna}>Contacto</h4>
            <span style={estilos.link}>info@kebracho.com.ar</span>
            <span style={estilos.link}>WhatsApp: +54 9 11 0000-0000</span>
            <span style={estilos.link}>Buenos Aires, Argentina</span>
          </div>
        </div>

        <div style={estilos.divisor} />

        <div style={estilos.legalFila}>
          <p style={estilos.legalTexto}>
            © {new Date().getFullYear()} Kebracho. Todos los derechos
            reservados.
          </p>
          <p style={estilos.legalTexto}>
            Venta regulada por la Ley 24.788, Res. 424/2020 y Ley 25.326 de
            Protección de Datos Personales.
          </p>
        </div>
      </div>
    </footer>
  );
}

const estilos: Record<string, React.CSSProperties> = {
  footer: {
    backgroundColor: '#1E1E1E',
    borderTop: '1px solid #3D3D3D',
    padding: '56px 24px 32px 24px',
  },
  contenedor: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  columnas: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 32,
    marginBottom: 32,
  },
  columna: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  marca: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#F2C229',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTexto: {
    color: '#1E1E1E',
    fontWeight: 800,
    fontSize: 16,
  },
  marcaTexto: {
    color: '#FFF8E0',
    fontWeight: 800,
    fontSize: 16,
    letterSpacing: 1,
  },
  descripcion: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 1.6,
    margin: 0,
  },
  advertencia: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 1.5,
    margin: 0,
  },
  tituloColumna: {
    color: '#FFF8E0',
    fontSize: 14,
    fontWeight: 700,
    margin: '0 0 4px 0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  link: {
    color: '#9ca3af',
    fontSize: 13,
  },
  divisor: {
    height: 1,
    backgroundColor: '#3D3D3D',
    marginBottom: 24,
  },
  legalFila: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  legalTexto: {
    color: '#6b7280',
    fontSize: 12,
    margin: 0,
  },
};

export default Footer;