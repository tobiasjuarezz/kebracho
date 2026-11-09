const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Escapa caracteres especiales para que lo que escribe el usuario
// (nombre, dirección) no rompa el HTML del mail
function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatearMoneda(numero) {
  return Number(numero).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
  });
}

async function enviarAlertaCompra({ pedido, items, usuario }) {
  const filasProductos = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5;">${escaparHtml(item.nombre)}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:center;">${item.cantidad}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:right;">$${formatearMoneda(item.precio_unitario)}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:right;">$${formatearMoneda(item.precio_unitario * item.cantidad)}</td>
        </tr>`
    )
    .join('');

  // Arma el mail con el mismo diseño para los dos destinatarios;
  // solo cambia el título y el texto de arriba
  function armarHtml(titulo, intro) {
    return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#222;">
      <div style="background-color:#2B2B2B;padding:20px;text-align:center;">
        <span style="color:#F2C229;font-size:22px;font-weight:bold;letter-spacing:1px;">KEBRACHO</span>
      </div>
      <div style="padding:24px;border:1px solid #e5e5e5;border-top:none;">
        <h2 style="margin-top:0;">${titulo}</h2>
        ${intro}
        <p><strong>Pedido:</strong> #${pedido.id}</p>
        <p><strong>Cliente:</strong> ${escaparHtml(usuario.nombre)} ${escaparHtml(usuario.apellido)} (${escaparHtml(usuario.email)})</p>
        <p><strong>Dirección de entrega:</strong> ${escaparHtml(pedido.direccion_entrega)}</p>

        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <thead>
            <tr style="background-color:#f5f5f5;">
              <th style="padding:8px;text-align:left;">Producto</th>
              <th style="padding:8px;text-align:center;">Cant.</th>
              <th style="padding:8px;text-align:right;">Precio</th>
              <th style="padding:8px;text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${filasProductos}
          </tbody>
        </table>

        <div style="text-align:right;margin-top:16px;font-size:18px;">
          <strong>Total: $${formatearMoneda(pedido.total)}</strong>
        </div>

        <p style="margin-top:24px;color:#888;font-size:12px;">
          Este es un correo automático generado por el sistema de Kebracho.
          Prohibida la venta de bebidas alcohólicas a menores de 18 años (Ley 24.788).
        </p>
      </div>
    </div>
  `;
  }

  const envios = [];

  // 1) Mail al cliente que hizo la compra (a la cuenta con la que se registró)
  if (usuario && usuario.email) {
    envios.push(
      transporter.sendMail({
        from: `"Kebracho" <${process.env.EMAIL_USER}>`,
        to: usuario.email,
        subject: `✅ Recibimos tu pedido #${pedido.id} - Kebracho`,
        html: armarHtml(
          `¡Gracias por tu compra, ${escaparHtml(usuario.nombre)}!`,
          '<p>Recibimos tu pedido y ya lo estamos preparando. Te avisamos cuando cambie de estado.</p>'
        ),
      })
    );
  }

  // 2) Mail al administrador (EMAIL_TO del .env) para preparar el pedido
  if (process.env.EMAIL_TO) {
    envios.push(
      transporter.sendMail({
        from: `"Kebracho" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO,
        subject: `🛒 Nueva compra #${pedido.id} - $${formatearMoneda(pedido.total)}`,
        html: armarHtml('🔔 Nueva compra realizada', ''),
      })
    );
  }

  // allSettled: si falla uno de los dos mails, el otro igual sale
  const resultados = await Promise.allSettled(envios);
  resultados.forEach((r) => {
    if (r.status === 'fulfilled') {
      console.log(`[email] Enviado a ${r.value.accepted.join(', ')}`);
    } else {
      console.error('[email] No se pudo enviar un mail:', r.reason);
    }
  });
}

module.exports = { enviarAlertaCompra };