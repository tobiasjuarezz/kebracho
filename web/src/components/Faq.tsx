import { useState } from 'react';

function Faq() {
  const preguntas = [
    {
      pregunta: '¿Necesito ser mayor de edad para comprar?',
      respuesta:
        'Sí. Por ley, solo se puede vender alcohol a personas mayores de 18 años. Al registrarte te pedimos tu fecha de nacimiento para verificarlo.',
    },
    {
      pregunta: '¿Cuánto tarda en llegar mi pedido?',
      respuesta:
        'El tiempo de entrega estándar es de 24 a 48 horas hábiles, según tu zona.',
    },
    {
      pregunta: '¿Qué medios de pago aceptan?',
      respuesta:
        'Por el momento coordinamos el pago por efectivo o transferencia bancaria una vez confirmado el pedido.',
    },
    {
      pregunta: '¿Puedo cambiar o cancelar mi pedido?',
      respuesta:
        'Sí, mientras el pedido no haya sido despachado. Contactanos apenas puedas para coordinarlo.',
    },
    {
      pregunta: '¿Hacen envíos a todo el país?',
      respuesta:
        'Hacemos envíos a la mayoría de las zonas de Argentina. Consultanos por tu localidad si tenés dudas.',
    },
  ];

  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <section style={estilos.seccion}>
      <div style={estilos.contenedor}>
        <h2 style={estilos.titulo}>Preguntas frecuentes</h2>
        <p style={estilos.subtitulo}>Todo lo que necesitás saber antes de comprar</p>

        <div style={estilos.lista}>
          {preguntas.map((item, indice) => {
            const estaAbierta = abierta === indice;
            return (
              <div key={item.pregunta} style={estilos.item}>
                <button
                  style={estilos.pregunta}
                  onClick={() => setAbierta(estaAbierta ? null : indice)}
                >
                  <span>{item.pregunta}</span>
                  <span style={estilos.icono}>{estaAbierta ? '−' : '+'}</span>
                </button>
                {estaAbierta ? (
                  <p style={estilos.respuesta}>{item.respuesta}</p>
                ) : null}
              </div>
            );
          })}
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
    maxWidth: 800,
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
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  item: {
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    borderRadius: 14,
    overflow: 'hidden',
  },
  pregunta: {
    width: '100%',
    backgroundColor: 'transparent',
    color: '#FFF8E0',
    fontSize: 15,
    fontWeight: 700,
    padding: '18px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
  },
  icono: {
    color: '#F2C229',
    fontSize: 20,
    fontWeight: 700,
    marginLeft: 12,
  },
  respuesta: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 1.6,
    padding: '0 20px 18px 20px',
    margin: 0,
  },
};

export default Faq;