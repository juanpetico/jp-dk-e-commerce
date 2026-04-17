import { createHash } from "crypto";
import prisma from "../../../config/prisma.js";

export type TokenValidationResult =
    | { valid: true }
    | { valid: false; reason: "expired" | "not_found" };

export const validateResetTokenUseCase = async (rawToken: string): Promise<TokenValidationResult> => {
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");

    const user = await prisma.user.findFirst({
        where: { passwordResetToken: hashedToken },
        select: { passwordResetExpires: true },
    });

    if (!user) return { valid: false, reason: "not_found" };

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        return { valid: false, reason: "expired" };
    }

    return { valid: true };
};
