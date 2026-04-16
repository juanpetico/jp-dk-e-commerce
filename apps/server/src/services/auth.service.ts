import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userService } from "./user.service.js";
import { couponService } from "./coupon.service.js";
import { shopConfigService } from "./shop-config.service.js";
import { AppError } from "../middleware/error-handler.js";

export const authService = {
    async register(data: { email: string; password: string; name?: string }) {
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
            }
        } catch (error) {
            console.error("Error asignando cupón de bienvenida:", error);
        }

        const token = this.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        return { user, token, welcomeCoupon };
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

        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
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
};
