import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { requireInternalApiKey } from "../middleware/internal-api.middleware.js";

const router: Router = Router();

router.post("/seed", requireInternalApiKey, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const adminPassword = await bcrypt.hash("Admin123!", 10);
        const superAdminPassword = await bcrypt.hash("Superadmin123!", 10);

        const admin = await prisma.user.upsert({
            where: { email: "admin@bg.cl" },
            update: { password: adminPassword, role: "ADMIN", name: "Administrador" },
            create: { email: "admin@bg.cl", password: adminPassword, name: "Administrador", role: "ADMIN" },
            select: { email: true, role: true },
        });

        const superAdmin = await prisma.user.upsert({
            where: { email: "superadmin@bg.cl" },
            update: { password: superAdminPassword, role: "SUPERADMIN", name: "Super Administrador" },
            create: { email: "superadmin@bg.cl", password: superAdminPassword, name: "Super Administrador", role: "SUPERADMIN" },
            select: { email: true, role: true },
        });

        res.json({ success: true, data: [admin, superAdmin] });
    } catch (error) {
        next(error);
    }
});

export default router;
