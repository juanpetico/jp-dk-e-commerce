import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Actualizando StoreConfig con Nuevos Parámetros Profesionales ---');

    const config = await prisma.storeConfig.upsert({
        where: { id: 'default' },
        update: {
            freeShippingThreshold: 50000,
            baseShippingCost: 3500,
            defaultTaxRate: 0.19,
            lowStockThreshold: 5,
            storeName: "JP DK",
            supportEmail: "soporte@jpdk.cl",
            maintenanceMode: false
        },
        create: {
            id: 'default',
            welcomeCouponCode: 'BIENVENIDA',
            vipThreshold: 100000,
            vipCouponCode: 'VIP_GANG',
            vipRewardMessage: '¡Felicidades! Por tu compra sobre $100.000 has ganado un 15% de descuento.',
            freeShippingThreshold: 50000,
            baseShippingCost: 3500,
            defaultTaxRate: 0.19,
            lowStockThreshold: 5,
            storeName: "JP DK",
            supportEmail: "soporte@jpdk.cl",
            maintenanceMode: false
        }
    });

    console.log('--- Configuración Actualizada ---');
    console.log(JSON.stringify(config, null, 2));
}

main()
    .catch(e => {
        console.error('Error durante la actualización:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
