import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL;
    const isServerless = process.env.VERCEL === "1";
    const pool = new Pool({
        connectionString,
        max: isServerless ? 1 : 10,
        idleTimeoutMillis: isServerless ? 0 : 30_000,
    });
    const adapter = new PrismaPg(pool as any);
    
    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = prisma;
}
