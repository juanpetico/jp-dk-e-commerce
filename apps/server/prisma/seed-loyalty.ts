import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Sincronizando cupones de fidelización...');

    const config = await prisma.storeConfig.findUnique({
        where: { id: 'default' }
    });

    if (!config) {
        console.log('No se encontró configuración por defecto. Creándola...');
        await prisma.storeConfig.create({
            data: { id: 'default' }
        });
        return main(); // Re-run to use default values
    }

    // Welcome Coupon
    await prisma.coupon.upsert({
        where: { code: config.welcomeCouponCode },
        update: {
            type: config.welcomeCouponType,
            value: config.welcomeCouponValue,
            isPublic: false,
            isActive: true,
            description: 'Cupón de bienvenida (Automático)'
        },
        create: {
            code: config.welcomeCouponCode,
            type: config.welcomeCouponType,
            value: config.welcomeCouponValue,
            isPublic: false,
            isActive: true,
            description: 'Cupón de bienvenida (Automático)',
            maxUsesPerUser: 1,
            startDate: new Date(),
        }
    });

    // VIP Coupon
    await prisma.coupon.upsert({
        where: { code: config.vipCouponCode },
        update: {
            type: config.vipCouponType,
            value: config.vipCouponValue,
            isPublic: false,
            isActive: true,
            description: `Beneficio VIP (Gasto > $${config.vipThreshold.toLocaleString('es-CL')})`
        },
        create: {
            code: config.vipCouponCode,
            type: config.vipCouponType,
            value: config.vipCouponValue,
            isPublic: false,
            isActive: true,
            description: `Beneficio VIP (Gasto > $${config.vipThreshold.toLocaleString('es-CL')})`,
            maxUsesPerUser: 1,
            startDate: new Date(),
        }
    });

    console.log('✅ Cupones sincronizados correctamente.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
