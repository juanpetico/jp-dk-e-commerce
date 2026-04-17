import { createHash } from "crypto";
import bcrypt from "bcrypt";
import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";

export const resetPasswordUseCase = async (rawToken: string, newPassword: string): Promise<void> => {
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");

    const user = await prisma.user.findFirst({
        where: {
            passwordResetToken: hashedToken,
            passwordResetExpires: { gt: new Date() },
        },
    });

    if (!user) {
        throw new AppError("El enlace de recuperación es inválido o ha expirado", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
        },
    });
};
