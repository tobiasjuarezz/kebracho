function Testimonios() {
  const reseñas = [
    {
      nombre: 'Martín G.',
      texto:
        'Pedí un pack de latas para la previa y llegó al otro día. Excelente atención y todo bien frío.',
      estrellas: 5,
    },
    {
      nombre: 'Lucía R.',
      texto:
        'Me compré el buzo y la gorra con el logo. La calidad está buenísima, repito seguro.',
      estrellas: 5,
    },
    {
      nombre: 'Fede A.',
      texto:
        'Buenos precios y la web es súper fácil de usar. Recomendado.',
      estrellas: 4,
    },
  ];

  return (
    <section style={estilos.seccion}>
      <div style={estilos.contenedor}>
        <h2 style={estilos.titulo}>Lo que dicen nuestros clientes</h2>
        <p style={estilos.subtitulo}>Reseñas de clientes</p>

        <div style={estilos.grilla}>
          {reseñas.map((reseña) => (
            <div key={reseña.nombre} style={estilos.card}>
              <div style={estilos.estrellas}>
                {'★'.repeat(reseña.estrellas)}
                {'☆'.repeat(5 - reseña.estrellas)}
              </div>
              <p style={estilos.texto}>"{reseña.texto}"</p>
              <span style={estilos.nombre}>{reseña.nombre}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const estilos: Record<string, React.CSSProperties> = {
  seccion: {
    backgroundColor: '#2B2B2B',
    borderTop: '1px solid #3D3D3D',
    borderBottom: '1px solid #3D3D3D',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 24,
  },
  card: {
    backgroundColor: '#1E1E1E',
    border: '1px solid #3D3D3D',
    borderRadius: 18,
    padding: 24,
  },
  estrellas: {
    color: '#F2C229',
    fontSize: 16,
    marginBottom: 12,
  },
  texto: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 1.6,
    margin: '0 0 16px 0',
  },
  nombre: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: 700,
  },
};

export default Testimonios;