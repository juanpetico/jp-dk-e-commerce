import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando carga de nuevos usuarios y órdenes (V2)...\n');

    // 1. Data Definitions (Existing Products & Categories)
    // We use the data provided by the user to ensure we link to the right entities.
    const categories = [
        { id: "cml9lb3xx00009i3khzqe4no7", name: "Poleras", slug: "poleras" },
        { id: "cml9lb3y500019i3ktzvi2v5a", name: "Polerones", slug: "polerones" },
        { id: "cml9oy5bj00009iokiycaohjh", name: "Lentes", slug: "lentes" }
    ];

    const products = [
        {
            id: "cml9lb3y900039i3ky553nlou",
            name: "Polera Shooters Pink Black",
            description: "Polera de algodón premium con diseño exclusivo Shooters",
            price: 25990,
            originalPrice: 60000,
            discountPercent: 57,
            isNew: true,
            isSale: true,
            slug: "polera-shooters-pink-black",
            stock: 50,
            sizes: ["S", "M"],
            categoryId: "cml9lb3xx00009i3khzqe4no7",
            image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: "cml9lb3yi00069i3k34c3h5oc",
            name: "Polera Shooters Blue White",
            description: "Polera deportiva con tecnología dry-fit",
            price: 29990,
            originalPrice: null,
            discountPercent: null,
            isNew: false,
            isSale: false,
            slug: "polera-shooters-blue-white",
            stock: 30,
            sizes: ["S", "M", "L", "XL"],
            categoryId: "cml9lb3xx00009i3khzqe4no7",
            image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: "cml9lb3yn00099i3kxzhulswr",
            name: "Polerón Shooters Ultra Pink",
            description: "Polerón con capucha, ideal para entrenamientos",
            price: 34990,
            originalPrice: null,
            discountPercent: null,
            isNew: true,
            isSale: false,
            slug: "poleron-shooters-ultra-pink",
            stock: 20,
            sizes: ["M", "L", "XL"],
            categoryId: "cml9lb3y500019i3ktzvi2v5a",
            image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: "cml9oyh4f00039ido4y6dq1dj",
            name: "Lente Bang Gang",
            description: "Lentes de sol estilo urbano, protección UV400.",
            price: 19990,
            originalPrice: null,
            discountPercent: null,
            isNew: true,
            isSale: false,
            slug: "lente-bang-gang",
            stock: 50,
            sizes: ["M"],
            categoryId: "cml9oy5bj00009iokiycaohjh",
            image: "https://bvnggvng.cl/cdn/shop/files/lente-bang-gang-negro-9610128.png?v=1757947882&width=823"
        },
        {
            id: "cml9oyh4p00079ido661jlvw2",
            name: "Polera Mystery",
            description: "Diseño sorpresa exclusivo de la colección.",
            price: 19990,
            originalPrice: null,
            discountPercent: null,
            isNew: true,
            isSale: false,
            slug: "polera-mystery",
            stock: 30,
            sizes: ["S", "M", "L", "XL"],
            categoryId: "cml9lb3xx00009i3khzqe4no7",
            image: "https://bvnggvng.cl/cdn/shop/files/polera-mystery-7988522.jpg?v=1751074333&width=713"
        }
    ];

    // 2. Ensure Categories Exist
    console.log('📁 Verificando categorías...');
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {
                // Ensure name and ID match if it exists by slug, but ID update in prisma is tricky if mismatched.
                // We'll trust slug.
            },
            create: {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
            }
        });
    }
    console.log('✅ Categorías verificadas');

    // 3. Ensure Products Exist
    console.log('👕 Verificando productos...');
    for (const prod of products) {
        await prisma.product.upsert({
            where: { slug: prod.slug },
            update: {}, // Don't overwrite existing data as per request
            create: {
                id: prod.id,
                name: prod.name,
                description: prod.description,
                price: prod.price,
                originalPrice: prod.originalPrice,
                discountPercent: prod.discountPercent,
                isNew: prod.isNew,
                isSale: prod.isSale,
                slug: prod.slug,
                stock: prod.stock,
                sizes: prod.sizes as any,
                isPublished: true,
                categoryId: prod.categoryId,
                images: {
                    create: [{ url: prod.image }]
                }
            }
        });
    }
    console.log('✅ Productos verificados\n');


    // 4. Create New Users
    console.log('👤 Creando nuevos usuarios...');
    const password = await bcrypt.hash('User123!', 10);

    const newUsers = [
        {
            email: 'diego.torres@example.com',
            name: 'Diego Torres',
            phone: '+56911223344',
            address: {
                street: 'Av. Libertador 1234',
                comuna: 'Santiago',
                region: 'Metropolitana',
                zipCode: '8320000'
            }
        },
        {
            email: 'valentina.rojas@example.com',
            name: 'Valentina Rojas',
            phone: '+56955667788',
            address: {
                street: 'Calle Los Alerces 567',
                comuna: 'Providencia',
                region: 'Metropolitana',
                zipCode: '7500000'
            }
        },
        {
            email: 'matias.soto@example.com',
            name: 'Matías Soto',
            phone: '+56999887766',
            address: {
                street: 'Pasaje El Roble 890',
                comuna: 'Maipú',
                region: 'Metropolitana',
                zipCode: '9250000'
            }
        }
    ];

    const createdUsers = [];

    for (const userData of newUsers) {
        // Create User
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: {
                email: userData.email,
                name: userData.name,
                password: password,
                phone: userData.phone,
                role: 'CLIENT'
            }
        });

        // Create Default Address
        const address = await prisma.address.create({
            data: {
                userId: user.id,
                name: userData.name.split(' ')[0] + ' House', // "Diego House"
                street: userData.address.street,
                comuna: userData.address.comuna,
                region: userData.address.region,
                country: 'Chile',
                zipCode: userData.address.zipCode,
                phone: userData.phone,
                isDefault: true,
            }
        });

        createdUsers.push({ user, address });
        console.log(`   + Creado usuario: ${user.name} (${user.email})`);
    }

    console.log('✅ 3 Usuarios creados\n');

    // 5. Create Orders for New Users
    console.log('📦 Creando órdenes...');

    // Helper to get random product
    const getRandomProduct = () => products[Math.floor(Math.random() * products.length)];
    const getRandomSize = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)];
    const getRandomDate = (daysAgo: number) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString();
    };

    let orderCount = 0;

    for (const { user, address } of createdUsers) {
        // Create 2 orders per user
        for (let i = 1; i <= 2; i++) {
            const numItems = Math.floor(Math.random() * 2) + 1; // 1 or 2 items
            const orderItems = [];
            let subtotal = 0;

            for (let j = 0; j < numItems; j++) {
                const prod = getRandomProduct();
                const qty = Math.floor(Math.random() * 2) + 1; // 1 or 2 qty
                const size = getRandomSize(prod.sizes);

                orderItems.push({
                    productId: prod.id,
                    quantity: qty,
                    price: prod.price,
                    size: size
                });
                subtotal += prod.price * qty;
            }

            const shippingCost = 3990;
            const taxRate = 0.19;
            const taxes = Math.round(subtotal * taxRate);
            const total = subtotal + shippingCost + taxes;

            // Randomize status
            const statuses = ['CONFIRMED', 'SHIPPED', 'DELIVERED'];
            const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
            const daysAgo = Math.floor(Math.random() * 30) + 1;

            const order = await prisma.order.create({
                data: {
                    userId: user.id,
                    date: getRandomDate(daysAgo),
                    status: status,
                    isPaid: true,
                    total,
                    subtotal,
                    shippingCost,
                    taxes,
                    taxRate,
                    shippingMethod: 'Starken Domicilio',
                    shippingAddressId: address.id,
                    billingAddressId: address.id,
                    items: {
                        create: orderItems.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            size: item.size as any
                        }))
                    }
                }
            });
            orderCount++;
        }
    }

    console.log(`✅ ${orderCount} Órdenes creadas exitosamente`);
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔑 Credenciales Nuevos Usuarios:');
    newUsers.forEach(u => console.log(`   - ${u.email} / User123!`));
    console.log('═══════════════════════════════════════════════════════\n');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
