function Confianza() {
  const datos = [
    { numero: '+500', texto: 'Clientes satisfechos' },
    { numero: '24/48hs', texto: 'Tiempo de envío' },
    { numero: '+50', texto: 'Productos disponibles' },
    { numero: '100%', texto: 'Compra segura' },
  ];

  return (
    <section style={estilos.seccion}>
      <div style={estilos.contenedor}>
        <div style={estilos.grilla}>
          {datos.map((dato) => (
            <div key={dato.texto} style={estilos.card}>
              <span style={estilos.numero}>{dato.numero}</span>
              <span style={estilos.texto}>{dato.texto}</span>
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
    padding: '48px 24px',
  },
  contenedor: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  grilla: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 24,
    textAlign: 'center',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  numero: {
    color: '#F2C229',
    fontSize: 32,
    fontWeight: 800,
  },
  texto: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 600,
  },
};

export default Confianza;