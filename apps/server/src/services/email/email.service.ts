import { Resend } from "resend";
import { AppError } from "../../middleware/error-handler.js";
import type { SendEmailOptions } from "./email.types.js";

let _client: Resend | null = null;

const getClient = (): Resend => {
    if (!_client) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) throw new AppError("RESEND_API_KEY no configurado", 500);
        _client = new Resend(apiKey);
    }
    return _client;
};

export const emailService = {
    async send(options: SendEmailOptions): Promise<void> {
        const fromName = process.env.EMAIL_FROM_NAME ?? "JP DK";
        const fromAddress = process.env.EMAIL_FROM_ADDRESS ?? "onboarding@resend.dev";

        const resend = getClient();
        const { error } = await resend.emails.send({
            from: `${fromName} <${fromAddress}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });

        if (error) {
            console.error(`[emailService] Resend error — from: ${fromAddress} | to: ${options.to}`, error);
            throw new Error(`Error al enviar email: ${error.message}`);
        }
    },

    async sendSilent(options: SendEmailOptions): Promise<void> {
        try {
            await this.send(options);
        } catch (err) {
            console.error("[emailService] Error enviando email (silenciado):", err);
        }
    },
};
