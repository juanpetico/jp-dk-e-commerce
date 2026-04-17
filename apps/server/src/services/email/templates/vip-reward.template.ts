import type { VipRewardEmailData } from "../email.types.js";

const formatDiscount = (value: number, type: "PERCENTAGE" | "FIXED_AMOUNT"): string =>
    type === "PERCENTAGE" ? `${value}%` : `$${value.toLocaleString("es-CL")}`;

export const buildVipRewardEmail = (data: VipRewardEmailData): string => {
    const frontendUrl = process.env.FRONTEND_URL ?? "https://jpdk.cl";
    const discount = formatDiscount(data.couponValue, data.couponType);

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido al club VIP</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <tr>
            <td style="background:#111111;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#d4af37;font-size:13px;font-weight:700;letter-spacing:3px;">VIP CLUB</p>
              <p style="margin:6px 0 0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:4px;">JP DK</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 12px;color:#111111;font-size:24px;">¡${data.userName}, ahora eres VIP! 🎉</h1>
              <p style="margin:0 0 24px;color:#555555;font-size:16px;line-height:1.6;">
                ${data.rewardMessage}
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#111111 0%,#2a2a2a 100%);border-radius:8px;padding:32px;text-align:center;">
                    <p style="margin:0 0 8px;color:#d4af37;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Tu cupón VIP exclusivo</p>
                    <p style="margin:0 0 8px;color:#ffffff;font-size:32px;font-weight:700;letter-spacing:4px;">${data.couponCode}</p>
                    <p style="margin:0;color:#d4af37;font-size:20px;font-weight:600;">${discount} de descuento</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;color:#555555;font-size:14px;line-height:1.6;">
                El cupón ya está asignado a tu cuenta. Solo ingrésalo en el checkout de tu próxima compra.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${frontendUrl}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:6px;font-size:15px;font-weight:600;letter-spacing:0.5px;">
                      Explorar colección
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
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
