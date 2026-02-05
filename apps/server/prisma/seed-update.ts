import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting update seed (Products & Orders)...\n');

    // 1. Create/Ensure Categories
    console.log('📁 Checking categories...');
    const categoryLentes = await prisma.category.upsert({
        where: { slug: 'lentes' },
        update: {},
        create: {
            name: 'Lentes',
            slug: 'lentes',
        },
    });

    const categoryPoleras = await prisma.category.upsert({
        where: { slug: 'poleras' },
        update: {},
        create: {
            name: 'Poleras',
            slug: 'poleras',
        },
    });
    console.log('✅ Categories checked/created\n');

    // 2. Create/Update Products
    console.log('👕 Creating/Updating products...');

    // Product 1: Lentes Bang Gang
    const productLentes = await prisma.product.upsert({
        where: { slug: 'lente-bang-gang' },
        update: {
            // Update images if needed, but for simplicity we assume they are there or we handle them specially if complex
            // upsert update doesn't deeply update relations easily without deleteMany/create, 
            // so we skip image update to avoid deleting existing ones if they exist.
        },
        create: {
            name: 'Lente Bang Gang',
            description: 'Lentes de sol estilo urbano, protección UV400.',
            price: 19990,
            stock: 50,
            slug: 'lente-bang-gang',
            sizes: ['M' as any], // Using 'M' as placeholder since 'One Size' is not in current enum
            isNew: true,
            isSale: false,
            isPublished: true,
            categoryId: categoryLentes.id,
            images: {
                create: [
                    { url: 'https://bvnggvng.cl/cdn/shop/files/lente-bang-gang-negro-9610128.png?v=1757947882&width=823' },
                    { url: 'https://bvnggvng.cl/cdn/shop/files/lente-bang-gang-blanco-8187847.png?v=1757947882' }
                ],
            },
        },
    });

    // Product 2: Polera Mystery
    const productMystery = await prisma.product.upsert({
        where: { slug: 'polera-mystery' },
        update: {},
        create: {
            name: 'Polera Mystery',
            description: 'Diseño sorpresa exclusivo de la colección.',
            price: 19990,
            stock: 30,
            slug: 'polera-mystery',
            sizes: ['S', 'M', 'L', 'XL'],
            isNew: true,
            isSale: false,
            isPublished: true,
            categoryId: categoryPoleras.id,
            images: {
                create: [
                    { url: 'https://bvnggvng.cl/cdn/shop/files/polera-mystery-7988522.jpg?v=1751074333&width=713' }
                ],
            },
        },
    });
    console.log('✅ Products checked/created\n');

    // 3. Ensure User Exists
    console.log('👤 Checking user...');

    const targetUserId = 'cml9lb40g000c9i3ksf6d3v56';
    const targetEmail = 'cliente@test.cl';

    // Check if user exists by ID or Email
    let user = await prisma.user.findFirst({
        where: {
            OR: [
                { id: targetUserId },
                { email: targetEmail }
            ]
        }
    });

    if (!user) {
        const hashedPassword = await bcrypt.hash('Test123!', 10);
        user = await prisma.user.create({
            data: {
                id: targetUserId,
                email: targetEmail,
                password: hashedPassword,
                name: 'Cliente Test',
                role: 'CLIENT',
                phone: '+56912345678'
            }
        });
        console.log(`✅ User created with ID ${targetUserId}`);
    } else {
        console.log(`ℹ️ User already exists (ID: ${user.id})`);
    }

    // Ensure user has at least one address (required for order)
    const existingAddress = await prisma.address.findFirst({
        where: { userId: user.id }
    });

    let addressId = existingAddress?.id;

    if (!addressId) {
        const address = await prisma.address.create({
            data: {
                userId: user.id,
                name: 'Casa Matriz',
                street: 'Calle Falsa 123',
                comuna: 'Santiago',
                region: 'RM',
                country: 'Chile',
                phone: '+56912345678',
                isDefault: true
            }
        });
        addressId = address.id;
        console.log('✅ Default address created');
    }

    // 4. Create Order (Idempotent check)
    // We check if there's already an order for this user with these specific products created recently (or just any order with these items to be safe against double run)
    // However, user specifically asked to NOT double insert data from seed-orders.ts.
    // We will look for an order that contains BOTH these product IDs for this user.

    console.log('📦 Checking order existence...');

    const existingOrder = await prisma.order.findFirst({
        where: {
            userId: user.id,
            items: {
                some: {
                    productId: productLentes.id
                }
            }
        },
        include: { items: true }
    });

    // Refined check: Check if it has the mystery shirt too, just to be sure it's THIS order
    const hasMystery = existingOrder?.items.some(item => item.productId === productMystery.id);

    if (existingOrder && hasMystery) {
        console.log(`⚠️ Order already exists for this user containing these products. Skipping creation.`);
        console.log(`   Order ID: ${existingOrder.id}`);
    } else {
        // Calculate totals
        // 1x Lentes (19990) + 1x Polera Mystery (19990)
        const qtyLentes = 1;
        const qtyMystery = 1;

        const subtotal = (productLentes.price * qtyLentes) + (productMystery.price * qtyMystery);
        const shippingCost = 0; // Free shipping maybe?
        const taxRate = 0.19;
        const taxes = Math.round(subtotal * taxRate);
        const total = subtotal + shippingCost + taxes;

        const order = await prisma.order.create({
            data: {
                userId: user.id,
                date: new Date().toISOString(),
                status: 'CONFIRMED',
                isPaid: true,
                total,
                subtotal,
                shippingCost,
                taxes,
                taxRate,
                shippingMethod: 'Envío Gratis',
                shippingAddressId: addressId!,
                billingAddressId: addressId!,
                items: {
                    create: [
                        {
                            productId: productLentes.id,
                            quantity: qtyLentes,
                            price: productLentes.price,
                            size: 'M' as any // Enum cast
                        },
                        {
                            productId: productMystery.id,
                            quantity: qtyMystery,
                            price: productMystery.price,
                            size: 'L' as any
                        }
                    ]
                }
            }
        });
        console.log(`✅ Order created successfully! ID: ${order.id}`);
    }

    console.log('\n🏁 Update seed completed.');
}

main()
    .catch((e) => {
        console.error('❌ Error during update seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
