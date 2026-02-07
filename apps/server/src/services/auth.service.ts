import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userService } from "./user.service.js";
import { couponService } from "./coupon.service.js";
import { shopConfigService } from "./shop-config.service.js";
import { AppError } from "../middleware/error-handler.js";

export const authService = {
    async register(data: { email: string; password: string; name?: string }) {
        // Check if user already exists
        const existingUser = await userService.getUserByEmail(data.email);
        if (existingUser) {
            throw new AppError("User already exists", 400);
        }

        // Create user
        const user = await userService.createUser(data);

        // TRIGGER: Asignar cupón de bienvenida (Billetera de Descuentos)
        try {
            const storeConfig = await shopConfigService.getConfig();
            await couponService.assignCouponToUser(user.id, storeConfig.welcomeCouponCode);
        } catch (error) {
            console.error("Error asignando cupón de bienvenida:", error);
            // No bloqueamos el registro si falla la asignación del cupón
        }

        // Generate token
        const token = this.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        return { user, token };
    },

    async login(email: string, password: string) {
        // Find user
        const user = await userService.getUserByEmailWithPassword(email);
        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError("Invalid credentials", 401);
        }

        // Generate token
        const token = this.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        // Return user without password
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
