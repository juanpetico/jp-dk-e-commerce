import { PrismaClient, Role, Size, OrderStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando carga de base de datos (V3)...\n');

    // 1. Categorías
    const categoriesData = [
        { name: "Poleras", slug: "poleras" },
        { name: "Polerones", slug: "polerones" },
        { name: "Lentes", slug: "lentes" }
    ];

    console.log('📁 Verificando categorías...');
    const categoryMap: Record<string, string> = {};
    for (const cat of categoriesData) {
        const category = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: { name: cat.name, slug: cat.slug }
        });
        categoryMap[cat.slug] = category.id;
    }
    console.log('✅ Categorías verificadas');

    // 2. Productos
    const productsData = [
        {
            name: "Polera Mystery",
            slug: "polera-mystery-v3",
            price: 19990,
            categoryId: categoryMap['poleras'],
            images: ["https://bvnggvng.cl/cdn/shop/files/polera-mystery-7988522.jpg?v=1751074333&width=713"]
        },
        {
            name: "Lente Bang Gang Blanco",
            slug: "lente-bang-gang-blanco",
            price: 24990,
            categoryId: categoryMap['lentes'],
            images: ["https://bvnggvng.cl/cdn/shop/files/lente-bang-gang-blanco-8187847.png?v=1757947882"]
        },
        {
            name: "Lente Bang Gang Negro",
            slug: "lente-bang-gang-negro",
            price: 24990,
            categoryId: categoryMap['lentes'],
            images: ["https://bvnggvng.cl/cdn/shop/files/lente-bang-gang-negro-9610128.png?v=1757947882&width=823"]
        },
        {
            name: "Polera Ice Cube BG",
            slug: "polera-ice-cube-bg",
            price: 22990,
            categoryId: categoryMap['poleras'],
            images: ["https://bvnggvng.cl/cdn/shop/files/polera-ice-cube-bg-50274641.png?v=1751168484&width=713"]
        },
        {
            name: "Polera Eminem BG",
            slug: "polera-eminem-bg",
            price: 22990,
            categoryId: categoryMap['poleras'],
            images: ["https://bvnggvng.cl/cdn/shop/files/polera-eminem-bg-71552354.png?v=1751168485&width=713"]
        },
        {
            name: "Polera 50 Cent BG",
            slug: "polera-50-cent-bg",
            price: 22990,
            categoryId: categoryMap['poleras'],
            images: ["https://bvnggvng.cl/cdn/shop/files/polera-50-cent-bg-28155442.png?v=1751168483&width=713"]
        },
        {
            name: "Polerón Shooters Ultra Melange",
            slug: "poleron-shooters-ultra-melange",
            price: 39990,
            categoryId: categoryMap['polerones'],
            images: [
                "https://bvnggvng.cl/cdn/shop/files/poleron-shooters-ultra-melange-8850734.png?v=1764237486&width=713",
                "https://bvnggvng.cl/cdn/shop/files/poleron-shooters-ultra-melange-9724002.png?v=1764237486&width=1100"
            ]
        }
    ];

    console.log('👕 Creando productos...');
    const createdProducts = [];
    for (const prod of productsData) {
        const product = await prisma.product.upsert({
            where: { slug: prod.slug },
            update: {},
            create: {
                name: prod.name,
                slug: prod.slug,
                price: prod.price,
                categoryId: prod.categoryId,
                isPublished: true,
                images: {
                    create: prod.images.map(url => ({ url }))
                },
                variants: {
                    create: [
                        { size: Size.S, stock: 10 },
                        { size: Size.M, stock: 15 },
                        { size: Size.L, stock: 20 },
                        { size: Size.XL, stock: 5 }
                    ]
                }
            }
        });
        createdProducts.push(product);
    }
    console.log(`✅ ${createdProducts.length} Productos creados`);

    // 3. Usuarios
    console.log('👤 Creando usuarios...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const usersData = [
        { email: 'admin1@bg.cl', name: 'Admin One', role: Role.ADMIN },
        { email: 'admin2@bg.cl', name: 'Admin Two', role: Role.ADMIN },
        { email: 'cliente1@bg.cl', name: 'Juan Perez', role: Role.CLIENT },
        { email: 'cliente2@bg.cl', name: 'Maria Lopez', role: Role.CLIENT },
        { email: 'cliente3@bg.cl', name: 'Carlos Ruiz', role: Role.CLIENT },
        { email: 'cliente4@bg.cl', name: 'Ana Silva', role: Role.CLIENT }
    ];

    const createdUsers = [];
    for (const u of usersData) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                name: u.name,
                password: hashedPassword,
                role: u.role,
                phone: '+56912345678'
            }
        });

        // Create a default address for everyone so we can create orders
        await prisma.address.create({
            data: {
                userId: user.id,
                name: 'Casa Principal',
                street: 'Av. Siempre Viva 742',
                comuna: 'Santiago',
                region: 'Metropolitana',
                phone: '+56912345678',
                isDefault: true
            }
        });

        createdUsers.push(user);
    }
    console.log(`✅ ${createdUsers.length} Usuarios creados`);

    // 4. Órdenes para asociar productos a usuarios
    console.log('📦 Creando órdenes asociativas...');
    for (let i = 0; i < createdUsers.length; i++) {
        const user = createdUsers[i];
        const address = await prisma.address.findFirst({ where: { userId: user.id } });

        // Cada usuario compra un producto "individual" y el Polerón Ultra Melange
        const individualProduct = createdProducts[i % 6]; // Uno de los primeros 6
        const melangeProduct = createdProducts[6]; // El Polerón Ultra Melange

        const subtotal = individualProduct.price + melangeProduct.price;
        const shippingCost = 3990;
        const taxes = Math.round(subtotal * 0.19);
        const total = subtotal + shippingCost + taxes;

        await prisma.order.create({
            data: {
                userId: user.id,
                date: new Date().toISOString(),
                status: OrderStatus.CONFIRMED,
                isPaid: true,
                total,
                subtotal,
                shippingCost,
                taxes,
                taxRate: 0.19,
                shippingAddressId: address!.id,
                billingAddressId: address!.id,
                items: {
                    create: [
                        {
                            productId: individualProduct.id,
                            quantity: 1,
                            price: individualProduct.price,
                            size: Size.M
                        },
                        {
                            productId: melangeProduct.id,
                            quantity: 1,
                            price: melangeProduct.price,
                            size: Size.L
                        }
                    ]
                }
            }
        });
    }
    console.log('✅ Órdenes creadas exitosamente');

    console.log('\n🚀 Sembrado completado con éxito!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
