import { createHash, randomBytes } from "crypto";
import prisma from "../../../config/prisma.js";
import { sendPasswordResetEmail } from "../../email/use-cases/send-password-reset.js";

const EXPIRES_IN_MS = 15 * 60 * 1000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://jpdk.cl";

export const forgotPasswordUseCase = async (email: string): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
        return;
    }

    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + EXPIRES_IN_MS);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordResetToken: hashedToken,
            passwordResetExpires: expires,
        },
    });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${rawToken}`;

    try {
        await sendPasswordResetEmail({
            userName: user.name ?? "Cliente",
            userEmail: user.email,
            resetUrl,
        });
    } catch (emailError) {
        console.error(`[forgotPassword] Email no enviado a ${user.email}. Token guardado en DB. Error:`, emailError);
    }
};
