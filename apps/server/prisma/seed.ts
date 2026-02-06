import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const email = "admin@tu-tienda.com";
    const password = "supersecurepassword123"; // En un entorno real, usar variable de entorno
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.user.upsert({
        where: { email },
        update: {
            role: "SUPERADMIN" as Role, // Cast to avoid TS error if types aren't fully updated yet
        },
        create: {
            email,
            name: "Super Admin",
            password: hashedPassword,
            role: "SUPERADMIN" as Role,
            phone: "+56912345678",
        },
    });

    console.log({ superAdmin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
