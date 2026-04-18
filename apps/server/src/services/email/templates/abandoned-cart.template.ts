import type { AbandonedCartEmailData } from "../email.types.js";

const clp = (amount: number): string =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(amount);

const sizeLabel: Record<string, string> = {
    S: "S", M: "M", L: "L", XL: "XL", XXL: "XXL", STD: "Talla única",
};

export const buildAbandonedCartEmail = (data: AbandonedCartEmailData): string => {
    const frontendUrl = process.env.FRONTEND_URL ?? "https://jpdk.cl";

    const itemRows = data.items
        .map(
            (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                ${item.imageUrl
                    ? `<td width="64" style="padding-right:14px;"><img src="${item.imageUrl}" alt="${item.productName}" width="64" height="64" style="display:block;border-radius:6px;object-fit:cover;" /></td>`
                    : ""}
                <td style="color:#111111;font-size:14px;line-height:1.4;">
                  <p style="margin:0 0 4px;font-weight:600;">${item.productName}</p>
                  <p style="margin:0;color:#6b7280;font-size:12px;">
                    ${sizeLabel[item.size] ?? item.size} · Cantidad ${item.quantity}
                  </p>
                </td>
                <td style="color:#111111;font-size:14px;text-align:right;white-space:nowrap;">
                  ${clp(item.price * item.quantity)}
                </td>
              </tr>
            </table>
          </td>
        </tr>`
        )
        .join("");

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu carrito te espera</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <tr>
            <td style="background:#111111;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:4px;">JP DK</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 12px;color:#111111;font-size:24px;">¿Olvidaste algo, ${data.userName}?</h1>
              <p style="margin:0 0 24px;color:#555555;font-size:16px;line-height:1.6;">
                Dejaste estos productos en tu carrito. Los guardamos para ti — termina tu compra antes de que se agoten.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tbody>
                  ${itemRows}
                </tbody>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:12px 0;color:#111111;font-size:16px;font-weight:700;border-top:2px solid #e5e7eb;">
                    Total estimado
                  </td>
                  <td style="padding:12px 0;color:#111111;font-size:16px;font-weight:700;text-align:right;border-top:2px solid #e5e7eb;">
                    ${clp(data.totalAmount)}
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${frontendUrl}/cart" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:6px;font-size:15px;font-weight:600;letter-spacing:0.5px;">
                      Terminar mi compra
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} JP DK · <a href="${frontendUrl}" style="color:#9ca3af;">jpdk.cl</a>
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
