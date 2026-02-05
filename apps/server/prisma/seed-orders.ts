import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de órdenes de prueba...\n');

    // 1. Crear categorías
    console.log('📁 Creando categorías...');
    const categoryPoleras = await prisma.category.upsert({
        where: { slug: 'poleras' },
        update: {},
        create: {
            name: 'Poleras',
            slug: 'poleras',
        },
    });

    const categoryPolerones = await prisma.category.upsert({
        where: { slug: 'polerones' },
        update: {},
        create: {
            name: 'Polerones',
            slug: 'polerones',
        },
    });

    console.log('✅ Categorías creadas\n');

    // 2. Crear productos
    console.log('👕 Creando productos...');
    const product1 = await prisma.product.upsert({
        where: { slug: 'polera-shooters-pink-black' },
        update: {},
        create: {
            name: 'Polera Shooters Pink Black',
            description: 'Polera de algodón premium con diseño exclusivo Shooters',
            price: 25990,
            stock: 50,
            slug: 'polera-shooters-pink-black',
            sizes: ['S', 'M', 'L', 'XL'],
            isNew: true,
            isSale: false,
            isPublished: true,
            categoryId: categoryPoleras.id,
            images: {
                create: [
                    { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80' },
                ],
            },
        },
    });

    const product2 = await prisma.product.upsert({
        where: { slug: 'polera-shooters-blue-white' },
        update: {},
        create: {
            name: 'Polera Shooters Blue White',
            description: 'Polera deportiva con tecnología dry-fit',
            price: 23990,
            originalPrice: 29990,
            discountPercent: 20,
            stock: 30,
            slug: 'polera-shooters-blue-white',
            sizes: ['S', 'M', 'L', 'XL'],
            isNew: false,
            isSale: true,
            isPublished: true,
            categoryId: categoryPoleras.id,
            images: {
                create: [
                    { url: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80' },
                ],
            },
        },
    });

    const product3 = await prisma.product.upsert({
        where: { slug: 'poleron-shooters-ultra-pink' },
        update: {},
        create: {
            name: 'Polerón Shooters Ultra Pink',
            description: 'Polerón con capucha, ideal para entrenamientos',
            price: 34990,
            stock: 20,
            slug: 'poleron-shooters-ultra-pink',
            sizes: ['M', 'L', 'XL'],
            isNew: true,
            isSale: false,
            isPublished: true,
            categoryId: categoryPolerones.id,
            images: {
                create: [
                    { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80' },
                ],
            },
        },
    });

    console.log('✅ Productos creados\n');

    // 3. Crear usuarios
    console.log('👤 Creando usuarios...');
    const hashedPassword = await bcrypt.hash('Test123!', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@shooters.cl' },
        update: {},
        create: {
            email: 'admin@shooters.cl',
            password: hashedPassword,
            name: 'Admin Shooters',
            phone: '+56912345678',
            role: 'ADMIN',
        },
    });

    const clientUser = await prisma.user.upsert({
        where: { email: 'cliente@test.cl' },
        update: {},
        create: {
            email: 'cliente@test.cl',
            password: hashedPassword,
            name: 'Juan Pérez',
            phone: '+56987654321',
            role: 'CLIENT',
        },
    });

    console.log('✅ Usuarios creados');
    console.log('   📧 Admin: admin@shooters.cl');
    console.log('   📧 Cliente: cliente@test.cl');
    console.log('   🔑 Password para ambos: Test123!\n');

    // 4. Crear direcciones
    console.log('📍 Creando direcciones...');
    const shippingAddress = await prisma.address.create({
        data: {
            userId: clientUser.id,
            name: 'Juan Pérez',
            rut: '12.345.678-9',
            street: 'Av. Providencia 1234, Depto 501',
            comuna: 'Santiago',
            region: 'Región Metropolitana',
            zipCode: '7500000',
            country: 'Chile',
            phone: '+56987654321',
            isDefault: true,
        },
    });

    const billingAddress = await prisma.address.create({
        data: {
            userId: clientUser.id,
            name: 'Juan Pérez',
            rut: '12.345.678-9',
            street: 'Av. Providencia 1234, Depto 501',
            comuna: 'Santiago',
            region: 'Región Metropolitana',
            zipCode: '7500000',
            country: 'Chile',
            phone: '+56987654321',
            isDefault: false,
        },
    });

    console.log('✅ Direcciones creadas\n');

    // 5. Crear órdenes con diferentes estados
    console.log('📦 Creando órdenes de prueba...\n');

    // Orden 1: PENDING (Pendiente)
    const order1Subtotal = product1.price * 2;
    const order1Shipping = 5990;
    const order1TaxRate = 0.19;
    const order1Taxes = Math.round(order1Subtotal * order1TaxRate);
    const order1Total = order1Subtotal + order1Shipping + order1Taxes;

    const order1 = await prisma.order.create({
        data: {
            userId: clientUser.id,
            date: new Date().toISOString(),
            total: order1Total,
            subtotal: order1Subtotal,
            shippingCost: order1Shipping,
            taxes: order1Taxes,
            taxRate: order1TaxRate,
            shippingMethod: 'Envío Express (24-48 hrs)',
            status: 'PENDING',
            isPaid: false,
            shippingAddressId: shippingAddress.id,
            billingAddressId: billingAddress.id,
            items: {
                create: [
                    {
                        productId: product1.id,
                        quantity: 2,
                        price: product1.price,
                        size: 'M',
                    },
                ],
            },
        },
    });

    console.log(`✅ Orden 1 creada: ${order1.id.slice(0, 8)} - PENDING - ${formatPrice(order1Total)}`);

    // Orden 2: CONFIRMED (Confirmado y Pagado)
    const order2Subtotal = product2.price * 1 + product3.price * 1;
    const order2Shipping = 5990;
    const order2Taxes = Math.round(order2Subtotal * 0.19);
    const order2Total = order2Subtotal + order2Shipping + order2Taxes;

    const order2 = await prisma.order.create({
        data: {
            userId: clientUser.id,
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hace 2 horas
            total: order2Total,
            subtotal: order2Subtotal,
            shippingCost: order2Shipping,
            taxes: order2Taxes,
            taxRate: 0.19,
            shippingMethod: 'Envío Estándar (3-5 días)',
            status: 'CONFIRMED',
            isPaid: true,
            paidAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            confirmedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            shippingAddressId: shippingAddress.id,
            billingAddressId: billingAddress.id,
            items: {
                create: [
                    {
                        productId: product2.id,
                        quantity: 1,
                        price: product2.price,
                        size: 'L',
                    },
                    {
                        productId: product3.id,
                        quantity: 1,
                        price: product3.price,
                        size: 'XL',
                    },
                ],
            },
        },
    });

    console.log(`✅ Orden 2 creada: ${order2.id.slice(0, 8)} - CONFIRMED - ${formatPrice(order2Total)}`);

    // Orden 3: SHIPPED (Enviado)
    const order3Subtotal = product1.price * 3;
    const order3Shipping = 5990;
    const order3Taxes = Math.round(order3Subtotal * 0.19);
    const order3Total = order3Subtotal + order3Shipping + order3Taxes;

    const order3 = await prisma.order.create({
        data: {
            userId: clientUser.id,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Hace 1 día
            total: order3Total,
            subtotal: order3Subtotal,
            shippingCost: order3Shipping,
            taxes: order3Taxes,
            taxRate: 0.19,
            shippingMethod: 'Envío Express (24-48 hrs)',
            status: 'SHIPPED',
            isPaid: true,
            paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            confirmedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            shippingAddressId: shippingAddress.id,
            billingAddressId: billingAddress.id,
            items: {
                create: [
                    {
                        productId: product1.id,
                        quantity: 3,
                        price: product1.price,
                        size: 'S',
                    },
                ],
            },
        },
    });

    console.log(`✅ Orden 3 creada: ${order3.id.slice(0, 8)} - SHIPPED - ${formatPrice(order3Total)}`);

    // Orden 4: DELIVERED (Entregado)
    const order4Subtotal = product2.price * 2 + product1.price * 1;
    const order4Shipping = 5990;
    const order4Taxes = Math.round(order4Subtotal * 0.19);
    const order4Total = order4Subtotal + order4Shipping + order4Taxes;

    const order4 = await prisma.order.create({
        data: {
            userId: clientUser.id,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Hace 5 días
            total: order4Total,
            subtotal: order4Subtotal,
            shippingCost: order4Shipping,
            taxes: order4Taxes,
            taxRate: 0.19,
            shippingMethod: 'Envío Estándar (3-5 días)',
            status: 'DELIVERED',
            isPaid: true,
            paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            confirmedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            shippingAddressId: shippingAddress.id,
            billingAddressId: billingAddress.id,
            items: {
                create: [
                    {
                        productId: product2.id,
                        quantity: 2,
                        price: product2.price,
                        size: 'M',
                    },
                    {
                        productId: product1.id,
                        quantity: 1,
                        price: product1.price,
                        size: 'L',
                    },
                ],
            },
        },
    });

    console.log(`✅ Orden 4 creada: ${order4.id.slice(0, 8)} - DELIVERED - ${formatPrice(order4Total)}`);

    // Orden 5: CANCELLED (Cancelado)
    const order5Subtotal = product3.price * 1;
    const order5Shipping = 5990;
    const order5Taxes = Math.round(order5Subtotal * 0.19);
    const order5Total = order5Subtotal + order5Shipping + order5Taxes;

    const order5 = await prisma.order.create({
        data: {
            userId: clientUser.id,
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Hace 3 días
            total: order5Total,
            subtotal: order5Subtotal,
            shippingCost: order5Shipping,
            taxes: order5Taxes,
            taxRate: 0.19,
            shippingMethod: 'Envío Express (24-48 hrs)',
            status: 'CANCELLED',
            isPaid: false,
            shippingAddressId: shippingAddress.id,
            billingAddressId: billingAddress.id,
            items: {
                create: [
                    {
                        productId: product3.id,
                        quantity: 1,
                        price: product3.price,
                        size: 'M',
                    },
                ],
            },
        },
    });

    console.log(`✅ Orden 5 creada: ${order5.id.slice(0, 8)} - CANCELLED - ${formatPrice(order5Total)}`);

    console.log('\n🎉 ¡Seed completado exitosamente!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 CREDENCIALES DE ACCESO');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n👨‍💼 USUARIO ADMIN:');
    console.log('   Email:    admin@shooters.cl');
    console.log('   Password: Test123!');
    console.log('\n👤 USUARIO CLIENTE:');
    console.log('   Email:    cliente@test.cl');
    console.log('   Password: Test123!');
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DE DATOS CREADOS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   ✓ 2 Categorías`);
    console.log(`   ✓ 3 Productos`);
    console.log(`   ✓ 2 Usuarios`);
    console.log(`   ✓ 2 Direcciones`);
    console.log(`   ✓ 5 Órdenes (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)`);
    console.log('═══════════════════════════════════════════════════════\n');
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(price);
}

main()
    .catch((e) => {
        console.error('❌ Error durante el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
