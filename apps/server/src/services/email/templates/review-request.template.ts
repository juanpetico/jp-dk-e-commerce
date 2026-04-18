import type { ReviewRequestEmailData } from "../email.types.js";

export const buildReviewRequestEmail = (data: ReviewRequestEmailData): string => {
    const frontendUrl = process.env.FRONTEND_URL ?? "https://jpdk.cl";
    const shortId = data.orderId.slice(-8).toUpperCase();

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
                <td style="color:#111111;font-size:14px;font-weight:600;line-height:1.4;">
                  ${item.productName}
                </td>
                <td style="text-align:right;">
                  <a href="${frontendUrl}/products/${item.productSlug}#review" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:8px 16px;border-radius:6px;font-size:13px;font-weight:600;">
                    Reseñar
                  </a>
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
  <title>¿Qué te pareció tu compra?</title>
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
              <h1 style="margin:0 0 12px;color:#111111;font-size:24px;">${data.userName}, ¿qué te pareció tu compra?</h1>
              <p style="margin:0 0 8px;color:#555555;font-size:16px;line-height:1.6;">
                Tu opinión ayuda a que otros clientes encuentren lo que buscan.
              </p>
              <p style="margin:0 0 28px;color:#9ca3af;font-size:13px;">
                Pedido #${shortId}
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tbody>
                  ${itemRows}
                </tbody>
              </table>

              <p style="margin:28px 0 0;color:#6b7280;font-size:13px;line-height:1.6;text-align:center;">
                ⭐⭐⭐⭐⭐ Tomará menos de un minuto.
              </p>
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
