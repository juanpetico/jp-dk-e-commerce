import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { AppError } from "../middleware/error-handler.js";

export const userService = {
    async createUser(data: {
        email: string;
        password: string;
        name?: string;
        role?: "CLIENT" | "ADMIN";
    }) {
        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role || "CLIENT",
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user;
    },

    async getUserById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return user;
    },

    async getUserByEmail(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        return user;
    },

    async updateUser(
        id: string,
        data: {
            name?: string;
            email?: string;
            password?: string;
        }
    ) {
        // Hash password if provided
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user;
    },

    async deleteUser(id: string) {
        await prisma.user.delete({
            where: { id },
        });
    },

    async getAllUsers() {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return users;
    },
};
