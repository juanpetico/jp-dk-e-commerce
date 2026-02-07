import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Asignando cupones retroactivamente ---');

    const welcomeCoupon = await prisma.coupon.findUnique({ where: { code: 'BIENVENIDA' } });
    if (!welcomeCoupon) throw new Error('Cupón BIENVENIDA no encontrado');

    const users = await prisma.user.findMany({
        where: {
            role: 'CLIENT',
            coupons: {
                none: { couponId: welcomeCoupon.id }
            }
        }
    });

    console.log(`Encontrados ${users.length} usuarios sin cupón de bienvenida.`);

    for (const user of users) {
        try {
            await prisma.userCoupon.create({
                data: {
                    userId: user.id,
                    couponId: welcomeCoupon.id
                }
            });
            console.log(`Asignado a: ${user.email}`);
        } catch (e) {
            console.error(`Error con ${user.email}:`, e.message);
        }
    }

    console.log('Proceso finalizado.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
