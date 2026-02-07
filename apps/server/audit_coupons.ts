import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const coupons = await prisma.coupon.findMany();
    console.log('--- Coupons in DB ---');
    console.log(JSON.stringify(coupons, null, 2));

    const config = await prisma.storeConfig.findUnique({ where: { id: "default" } });
    console.log('--- Store Config ---');
    console.log(JSON.stringify(config, null, 2));

    const userCoupons = await prisma.userCoupon.findMany({
        include: {
            user: { select: { email: true } },
            coupon: { select: { code: true } }
        }
    });
    console.log('--- User Coupon Assignments ---');
    console.log(JSON.stringify(userCoupons, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
