import { emailService } from "../email.service.js";
import { buildWelcomeEmail } from "../templates/welcome.template.js";
import type { WelcomeEmailData } from "../email.types.js";

export const sendWelcomeEmail = async (data: WelcomeEmailData): Promise<void> => {
    const html = buildWelcomeEmail(data);
    await emailService.sendSilent({
        to: data.userEmail,
        subject: "¡Bienvenido a JP DK! Aquí está tu regalo 🎁",
        html,
    });
};
