import type { WelcomeEmailData } from "../email.types.js";

const formatDiscount = (value: number, type: "PERCENTAGE" | "FIXED_AMOUNT"): string =>
    type === "PERCENTAGE" ? `${value}%` : `$${value.toLocaleString("es-CL")}`;

export const buildWelcomeEmail = (data: WelcomeEmailData): string => {
    const discount = formatDiscount(data.couponValue, data.couponType);
    const name = data.userName ?? "Cliente";

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido a JP DK</title>
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

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 12px;color:#111111;font-size:24px;">¡Bienvenido, ${name}!</h1>
              <p style="margin:0 0 24px;color:#555555;font-size:16px;line-height:1.6;">
                Nos alegra tenerte en la familia JP DK. Como regalo de bienvenida, te enviamos este cupón exclusivo para tu primera compra.
              </p>

              <!-- Coupon box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#f9fafb;border:2px dashed #d1d5db;border-radius:8px;padding:24px;text-align:center;">
                    <p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Tu cupón de bienvenida</p>
                    <p style="margin:0 0 8px;color:#111111;font-size:32px;font-weight:700;letter-spacing:3px;">${data.couponCode}</p>
                    <p style="margin:0;color:#059669;font-size:18px;font-weight:600;">${discount} de descuento</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;color:#555555;font-size:14px;line-height:1.6;">
                Copia el código y úsalo al momento del checkout. El cupón ya está disponible en tu perfil.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://jpdk.cl" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:6px;font-size:15px;font-weight:600;letter-spacing:0.5px;">
                      Ir a la tienda
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
                Si tienes dudas escríbenos a <a href="mailto:soporte@jpdk.cl" style="color:#9ca3af;">soporte@jpdk.cl</a>
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
