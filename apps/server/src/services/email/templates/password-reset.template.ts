import type { PasswordResetEmailData } from "../email.types.js";

export const buildPasswordResetEmail = (data: PasswordResetEmailData): string => {
    const name = data.userName ?? "Cliente";

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recuperar contraseña — JP DK</title>
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
              <h1 style="margin:0 0 12px;color:#111111;font-size:22px;">Recupera tu contraseña</h1>
              <p style="margin:0 0 8px;color:#555555;font-size:15px;">Hola, ${name}.</p>
              <p style="margin:0 0 32px;color:#555555;font-size:15px;line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                Haz clic en el botón a continuación para crear una nueva. Este enlace expira en <strong>15 minutos</strong>.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${data.resetUrl}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:6px;font-size:15px;font-weight:600;">
                      Restablecer contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef9c3;border-radius:6px;padding:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0;color:#854d0e;font-size:13px;line-height:1.6;">
                      ⚠️ Si no solicitaste este cambio, ignora este correo. Tu contraseña no será modificada.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                <a href="${data.resetUrl}" style="color:#6b7280;word-break:break-all;">${data.resetUrl}</a>
              </p>
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
