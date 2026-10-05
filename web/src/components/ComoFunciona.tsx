function ComoFunciona() {
  const pasos = [
    {
      numero: '1',
      titulo: 'Elegí tus productos',
      texto: 'Navegá el catálogo y encontrá lo que buscás',
    },
    {
      numero: '2',
      titulo: 'Agregalo al carrito',
      texto: 'Sumá todo lo que quieras en una sola compra',
    },
    {
      numero: '3',
      titulo: 'Confirmá tu pedido',
      texto: 'Dejanos tu dirección y coordinamos el pago',
    },
    {
      numero: '4',
      titulo: 'Recibilo en tu casa',
      texto: 'Tu pedido llega en 24/48hs a donde estés',
    },
  ];

  return (
    <section style={estilos.seccion}>
      <div style={estilos.contenedor}>
        <h2 style={estilos.titulo}>Cómo funciona</h2>
        <p style={estilos.subtitulo}>Comprar en Kebracho es simple y rápido</p>

        <div style={estilos.grilla}>
          {pasos.map((paso) => (
            <div key={paso.numero} style={estilos.card}>
              <div style={estilos.numeroBox}>{paso.numero}</div>
              <h3 style={estilos.pasoTitulo}>{paso.titulo}</h3>
              <p style={estilos.pasoTexto}>{paso.texto}</p>
            </div>
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 24,
  },
  card: {
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    borderRadius: 18,
    padding: 24,
    textAlign: 'center',
  },
  numeroBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F2C229',
    color: '#1E1E1E',
    fontWeight: 800,
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
  },
  pasoTitulo: {
    color: '#FFF8E0',
    fontSize: 16,
    fontWeight: 700,
    margin: '0 0 8px 0',
  },
  pasoTexto: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 1.5,
    margin: 0,
  },
};

export default ComoFunciona;