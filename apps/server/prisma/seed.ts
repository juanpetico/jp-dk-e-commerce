import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
    const adminPassword = await bcrypt.hash("Admin123!", 10);
    const superAdminPassword = await bcrypt.hash("Superadmin123!", 10);

    const admin = await prisma.user.upsert({
        where: { email: "admin@bg.cl" },
        update: { password: adminPassword, role: "ADMIN", name: "Administrador" },
        create: {
            email: "admin@bg.cl",
            password: adminPassword,
            name: "Administrador",
            role: "ADMIN",
        },
    });

    const superAdmin = await prisma.user.upsert({
        where: { email: "superadmin@bg.cl" },
        update: { password: superAdminPassword, role: "SUPERADMIN", name: "Super Administrador" },
        create: {
            email: "superadmin@bg.cl",
            password: superAdminPassword,
            name: "Super Administrador",
            role: "SUPERADMIN",
        },
    });

    console.log("✅ Seed completado:");
    console.log(`   - ${admin.email} (${admin.role})`);
    console.log(`   - ${superAdmin.email} (${superAdmin.role})`);
}

main()
    .catch((e) => {
        console.error("❌ Error en seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
