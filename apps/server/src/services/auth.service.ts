import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { userService } from "./user.service.js";
import { couponService } from "./coupon.service.js";
import { shopConfigService } from "./shop-config.service.js";
import { AppError } from "../middleware/error-handler.js";
import { sendWelcomeEmail } from "./email/use-cases/send-welcome.js";
import { forgotPasswordUseCase } from "./auth/use-cases/forgot-password.js";
import { resetPasswordUseCase } from "./auth/use-cases/reset-password.js";
import { validateResetTokenUseCase } from "./auth/use-cases/validate-reset-token.js";
import type { TokenValidationResult } from "./auth/use-cases/validate-reset-token.js";

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const authService = {
    async register(data: { email: string; password: string; name?: string; phone?: string }) {
        const existingUser = await userService.getUserByEmail(data.email);
        if (existingUser) {
            throw new AppError("User already exists", 400);
        }

        const user = await userService.createUser(data);

        let welcomeCoupon = null;
        try {
            const storeConfig = await shopConfigService.getConfig();
            const result = await couponService.assignCouponToUser(user.id, storeConfig.welcomeCouponCode);

            if (result?.isNew) {
                welcomeCoupon = {
                    code: storeConfig.welcomeCouponCode,
                    message: "¡Bienvenido! Tienes un nuevo cupón en tu perfil"
                };

                void sendWelcomeEmail({
                    userName: user.name ?? "Cliente",
                    userEmail: user.email,
                    couponCode: storeConfig.welcomeCouponCode,
                    couponValue: storeConfig.welcomeCouponValue,
                    couponType: storeConfig.welcomeCouponType,
                });
            }
        } catch (error) {
            console.error("Error asignando cupón de bienvenida:", error);
        }

        const token = this.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = await this.issueRefreshToken(user.id);

        return { user, token, refreshToken, welcomeCoupon };
    },

    async isEmailAvailable(email: string) {
        const existingUser = await userService.getUserByEmail(email.trim());
        return !existingUser;
    },

    async login(email: string, password: string) {
        const user = await userService.getUserByEmailWithPassword(email);
        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError("Invalid credentials", 401);
        }

        if (!user.isActive) {
            const reason = user.deactivationReason?.trim() || "Sin motivo especificado";
            throw new AppError(`Cuenta desactivada. Motivo: ${reason}`, 403);
        }

        // Update lastLogin timestamp
        try {
            const prisma = (await import("../config/prisma.js")).default;
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() },
            });
        } catch {
            // Non-critical — do not block login if lastLogin update fails
        }

        const token = this.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = await this.issueRefreshToken(user.id);
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token, refreshToken };
    },

    generateToken(payload: { id: string; email: string; role: string }): string {
        const jwtSecret = process.env.JWT_SECRET;
        const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

        if (!jwtSecret) {
            throw new AppError("JWT secret not configured", 500);
        }

        return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);
    },

    verifyToken(token: string) {
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new AppError("JWT secret not configured", 500);
        }

        try {
            return jwt.verify(token, jwtSecret);
        } catch (error) {
            throw new AppError("Invalid token", 401);
        }
    },

    generateRefreshToken(): string {
        return crypto.randomBytes(64).toString("hex");
    },

    async issueRefreshToken(userId: string): Promise<string> {
        const prisma = (await import("../config/prisma.js")).default;
        const token = this.generateRefreshToken();
        const expires = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: token, refreshTokenExpires: expires },
        });
        return token;
    },

    async refreshAccessToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
        const prisma = (await import("../config/prisma.js")).default;

        const user = await prisma.user.findUnique({
            where: { refreshToken },
            select: { id: true, email: true, role: true, isActive: true, refreshTokenExpires: true },
        });

        if (!user || !user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
            throw new AppError("Invalid or expired refresh token", 401);
        }

        if (!user.isActive) {
            throw new AppError("Account deactivated", 401);
        }

        const accessToken = this.generateToken({ id: user.id, email: user.email, role: user.role });
        const newRefreshToken = await this.issueRefreshToken(user.id);

        return { token: accessToken, refreshToken: newRefreshToken };
    },

    async revokeRefreshToken(userId: string): Promise<void> {
        const prisma = (await import("../config/prisma.js")).default;
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null, refreshTokenExpires: null },
        });
    },

    async forgotPassword(email: string): Promise<void> {
        await forgotPasswordUseCase(email);
    },

    async resetPassword(token: string, newPassword: string): Promise<void> {
        await resetPasswordUseCase(token, newPassword);
    },

    async validateResetToken(token: string): Promise<TokenValidationResult> {
        return validateResetTokenUseCase(token);
    },
};
