import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Páginas institucionales que estaban linkeadas en el menú y el footer pero no existían
const CONTENIDO: Record<string, { titulo: string; parrafos: string[] }> = {
  nosotros: {
    titulo: 'Nosotros',
    parrafos: [
      'Kebracho es una marca de bebidas pensada para la juntada, la previa y los momentos compartidos con amigos.',
      'El nombre viene del quebracho, un árbol autóctono de la Argentina conocido por la dureza de su madera: algo propio, fuerte y que aguanta.',
      'Kebracho es un proyecto académico de la E.E.S. Técnica N°1 de Esteban Echeverría. No tiene producción ni venta real.',
    ],
  },
  contacto: {
    titulo: 'Contacto',
    parrafos: [
      '¿Tenés dudas sobre un pedido? Escribinos y te respondemos a la brevedad.',
      'El pago y la entrega se coordinan por WhatsApp una vez confirmado el pedido.',
      'Zona de entrega: Zona Sur del Gran Buenos Aires.',
    ],
  },
  terminos: {
    titulo: 'Términos y condiciones',
    parrafos: [
      'Para comprar en Kebracho tenés que ser mayor de 18 años. La edad se valida al crear la cuenta.',
      'Los pedidos quedan en estado "pendiente" hasta que se coordinan el pago y la entrega.',
      'Los precios y el stock pueden cambiar sin previo aviso.',
      'Beber con moderación. Prohibida su venta a menores de 18 años (Ley 24.788).',
    ],
  },
  privacidad: {
    titulo: 'Política de privacidad',
    parrafos: [
      'Solo guardamos los datos necesarios para tu cuenta y tus pedidos: nombre, apellido, email, fecha de nacimiento y dirección de entrega.',
      'La contraseña se guarda encriptada; nadie del equipo puede verla.',
      'No compartimos tus datos con terceros.',
    ],
  },
};

function Info({ seccion }: { seccion: keyof typeof CONTENIDO }) {
  const contenido = CONTENIDO[seccion];

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        <Link to="/" style={{ color: '#F2C229', fontWeight: 600 }}>
          ← Volver al inicio
        </Link>
        <h1 style={{ color: '#FFF8E0', fontSize: 32, fontWeight: 800, margin: '20px 0 24px' }}>
          {contenido.titulo}
        </h1>
        {contenido.parrafos.map((parrafo) => (
          <p key={parrafo} style={{ color: '#9ca3af', fontSize: 16, lineHeight: 1.6 }}>
            {parrafo}
          </p>
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default Info;
