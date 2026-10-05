import { useState } from 'react';

// Pantalla de verificación de edad (Ley 24.788): antes de ver la web hay que confirmar ser +18.
// La respuesta se guarda en el navegador para no preguntar en cada visita.
function VerificacionEdad({ children }: { children: React.ReactNode }) {
  const [confirmado, setConfirmado] = useState(() => {
    try {
      return localStorage.getItem('mayorDeEdad') === 'true';
    } catch {
      return false;
    }
  });
  const [rechazado, setRechazado] = useState(false);

  if (confirmado) return <>{children}</>;

  const confirmar = () => {
    try {
      localStorage.setItem('mayorDeEdad', 'true');
    } catch {
      // si el navegador no deja guardar, igual lo dejamos pasar en esta visita
    }
    setConfirmado(true);
  };

  return (
    <div style={estilos.fondo}>
      <div style={estilos.card}>
        <img src="/isotipo.png" alt="Kebracho" style={estilos.isotipo} />
        {rechazado ? (
          <>
            <h1 style={estilos.titulo}>Volvé cuando seas mayor 😉</h1>
            <p style={estilos.texto}>
              El contenido de Kebracho es solo para mayores de 18 años.
            </p>
          </>
        ) : (
          <>
            <h1 style={estilos.titulo}>¿Sos mayor de 18 años?</h1>
            <p style={estilos.texto}>
              Para entrar a Kebracho tenés que ser mayor de edad.
            </p>
            <div style={estilos.botones}>
              <button style={estilos.botonSi} onClick={confirmar}>
                Sí, soy mayor
              </button>
              <button style={estilos.botonNo} onClick={() => setRechazado(true)}>
                No
              </button>
            </div>
          </>
        )}
        <p style={estilos.leyenda}>
          Beber con moderación. Prohibida su venta a menores de 18 años.
        </p>
      </div>
    </div>
  );
}

const estilos: Record<string, React.CSSProperties> = {
  fondo: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#1E1E1E',
  },
  card: {
    backgroundColor: '#2B2B2B',
    border: '1px solid #3D3D3D',
    borderRadius: 20,
    padding: 32,
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
  },
  isotipo: {
    width: 88,
    height: 88,
    margin: '0 auto 16px',
  },
  titulo: {
    color: '#FFF8E0',
    fontSize: 24,
    fontWeight: 800,
    margin: '0 0 8px',
  },
  texto: {
    color: '#9ca3af',
    fontSize: 15,
    margin: '0 0 24px',
  },
  botones: {
    display: 'flex',
    gap: 12,
  },
  botonSi: {
    flex: 1,
    backgroundColor: '#F2C229',
    color: '#1E1E1E',
    fontWeight: 700,
    fontSize: 15,
    padding: '14px 0',
    borderRadius: 12,
  },
  botonNo: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#FFF8E0',
    border: '1px solid #3D3D3D',
    fontWeight: 700,
    fontSize: 15,
    padding: '14px 0',
    borderRadius: 12,
  },
  leyenda: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 0,
  },
};

export default VerificacionEdad;
