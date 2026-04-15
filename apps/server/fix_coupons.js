const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {

    // 1. Asegurar Cupón de Bienvenida
    const welcomeCoupon = await prisma.coupon.upsert({
        where: { code: 'BIENVENIDA' },
        update: {},
        create: {
            code: 'BIENVENIDA',
            description: 'Cupón de bienvenida para nuevos usuarios',
            type: 'PERCENTAGE',
            value: 10,
            minAmount: 0,
            isPublic: false,
            isActive: true,
        }
    });

    // 2. Asegurar Cupón VIP
    const vipCoupon = await prisma.coupon.upsert({
        where: { code: 'VIP_GANG' },
        update: {},
        create: {
            code: 'VIP_GANG',
            description: 'Cupón VIP por compras sobre el umbral',
            type: 'PERCENTAGE',
            value: 15,
            minAmount: 0,
            isPublic: false, // Privado para billetera
            isActive: true,
        }
    });

    // 3. Asegurar Configuración Inicial
    const config = await prisma.storeConfig.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            welcomeCouponCode: 'BIENVENIDA',
            vipThreshold: 100000,
            vipCouponCode: 'VIP_GANG',
            vipRewardMessage: '¡Felicidades! Por tu compra sobre $100.000 has ganado un 15% de descuento para tu próximo pedido.'
        }
    });
}

main()
    .catch(e => {
        console.error('Error durante la reparación:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
