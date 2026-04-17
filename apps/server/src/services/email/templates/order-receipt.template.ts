import type { OrderReceiptEmailData } from "../email.types.js";

const clp = (amount: number): string =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(amount);

const sizeLabel: Record<string, string> = {
    S: "S", M: "M", L: "L", XL: "XL", XXL: "XXL", STD: "Talla única",
};

export const buildOrderReceiptEmail = (data: OrderReceiptEmailData): string => {
    const itemRows = data.items
        .map(
            (item) => `
        <tr>
          <td style="padding:10px 0;color:#111111;font-size:14px;border-bottom:1px solid #e5e7eb;">
            ${item.productName}
            <span style="color:#6b7280;font-size:12px;"> · ${sizeLabel[item.size] ?? item.size}</span>
          </td>
          <td style="padding:10px 0;color:#6b7280;font-size:14px;text-align:center;border-bottom:1px solid #e5e7eb;">
            ${item.quantity}
          </td>
          <td style="padding:10px 0;color:#111111;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">
            ${clp(item.price * item.quantity)}
          </td>
        </tr>`
        )
        .join("");

    const couponRow =
        data.discountAmount > 0
            ? `<tr>
          <td colspan="2" style="padding:6px 0;color:#059669;font-size:14px;">
            Descuento${data.couponCode ? ` (${data.couponCode})` : ""}
          </td>
          <td style="padding:6px 0;color:#059669;font-size:14px;text-align:right;">-${clp(data.discountAmount)}</td>
        </tr>`
            : "";

    const shortId = data.orderId.slice(-8).toUpperCase();

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de pedido #${shortId}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#111111;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:4px;">JP DK</p>
            </td>
          </tr>

          <!-- Confirmation banner -->
          <tr>
            <td style="background:#059669;padding:16px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:15px;font-weight:600;">✓ Pago confirmado — Pedido #${shortId}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 8px;color:#111111;font-size:22px;">¡Gracias por tu compra, ${data.customerName}!</h1>
              <p style="margin:0 0 32px;color:#555555;font-size:15px;">
                Hemos recibido tu pago. Te avisaremos cuando tu pedido sea despachado.
              </p>

              <!-- Items table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <thead>
                  <tr>
                    <th style="padding:0 0 10px;color:#6b7280;font-size:12px;font-weight:600;text-align:left;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5e7eb;">Producto</th>
                    <th style="padding:0 0 10px;color:#6b7280;font-size:12px;font-weight:600;text-align:center;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5e7eb;">Cant.</th>
                    <th style="padding:0 0 10px;color:#6b7280;font-size:12px;font-weight:600;text-align:right;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td colspan="2" style="padding:6px 0;color:#555555;font-size:14px;">Subtotal</td>
                  <td style="padding:6px 0;color:#555555;font-size:14px;text-align:right;">${clp(data.subtotal)}</td>
                </tr>
                ${couponRow}
                <tr>
                  <td colspan="2" style="padding:6px 0;color:#555555;font-size:14px;">Envío</td>
                  <td style="padding:6px 0;color:#555555;font-size:14px;text-align:right;">${data.shippingCost === 0 ? "Gratis" : clp(data.shippingCost)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:6px 0;color:#555555;font-size:14px;">IVA (19%)</td>
                  <td style="padding:6px 0;color:#555555;font-size:14px;text-align:right;">${clp(data.taxes)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:10px 0 0;color:#111111;font-size:16px;font-weight:700;border-top:2px solid #e5e7eb;">Total pagado</td>
                  <td style="padding:10px 0 0;color:#111111;font-size:16px;font-weight:700;text-align:right;border-top:2px solid #e5e7eb;">${clp(data.total)}</td>
                </tr>
              </table>

              <!-- Shipping address -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:6px;padding:20px;margin-bottom:32px;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Dirección de envío</p>
                    <p style="margin:0;color:#111111;font-size:14px;line-height:1.6;">
                      ${data.shippingStreet}<br />
                      ${data.shippingComuna}, ${data.shippingRegion}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://jpdk.cl/cuenta/pedidos" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:6px;font-size:15px;font-weight:600;">
                      Ver mi pedido
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} JP DK · <a href="https://jpdk.cl" style="color:#9ca3af;">jpdk.cl</a>
              </p>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">
                ¿Dudas? Escríbenos a <a href="mailto:soporte@jpdk.cl" style="color:#9ca3af;">soporte@jpdk.cl</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
