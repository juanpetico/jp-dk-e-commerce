import { PrismaClient, Role, Size, OrderStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import _slugify from "slugify";
const slugify = (_slugify as any).default || _slugify;

const prisma = new PrismaClient();

async function main() {
    console.log("Starting updated seed...");

    // 1. Hash Password
    const hashedPassword = await bcrypt.hash("Admin123!", 10);

    // 2. Seed Users (with realistic names)
    console.log("Seeding users...");
    const usersData = [
        {
            email: "superadmin@banggang.cl",
            name: "Juan Sebastián Arriagada",
            password: hashedPassword,
            role: Role.SUPERADMIN,
            phone: "+56912345678",
        },
        {
            email: "admin@banggang.cl",
            name: "Camila Paz Valdez",
            password: hashedPassword,
            role: Role.ADMIN,
            phone: "+56987654321",
        },
        { email: "diego.soto@gmail.com", name: "Diego Soto", password: hashedPassword, role: Role.CLIENT, phone: "+56955554444" },
        { email: "valentina.rios@gmail.com", name: "Valentina Ríos", password: hashedPassword, role: Role.CLIENT, phone: "+56933332222" },
        { email: "matias.bravo@gmail.com", name: "Matías Bravo", password: hashedPassword, role: Role.CLIENT, phone: "+56911119999" },
        { email: "antonia.lopez@gmail.com", name: "Antonia López", password: hashedPassword, role: Role.CLIENT, phone: "+56977778888" },
        { email: "nicolas.torres@gmail.com", name: "Nicolás Torres", password: hashedPassword, role: Role.CLIENT, phone: "+56966660000" },
    ];

    const userRecords: any[] = [];
    for (const userData of usersData) {
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {
                password: userData.password,
                name: userData.name,
                phone: userData.phone,
            },
            create: userData,
        });
        userRecords.push(user);

        // Create an address for each user to use in orders
        await prisma.address.upsert({
            where: { id: `addr-${user.id}` }, // Fixed ID for seeding consistency
            update: {},
            create: {
                id: `addr-${user.id}`,
                name: "Mi Casa",
                street: "Avenida Siempreviva 123",
                comuna: "Santiago",
                region: "Metropolitana",
                phone: user.phone || "+56900000000",
                userId: user.id,
                isDefault: true,
            },
        });
    }

    // 3. Seed Categories
    console.log("Seeding categories...");
    const categories = [
        { name: "Polerones", slug: "polerones" },
        { name: "Poleras", slug: "poleras" },
        { name: "Lentes", slug: "lentes" },
    ];

    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
        const createdCat = await prisma.category.upsert({
            where: { name: cat.name },
            update: {},
            create: cat,
        });
        categoryMap[cat.name] = createdCat.id;
    }

    // 4. Seed Products
    console.log("Seeding products...");
    const textileSizes: Size[] = ["S", "M", "L", "XL", "XXL"];
    const accessorySizes: Size[] = ["STD"];

    const productsDataBase = [
        {
            name: "Polerón Shooters Ultra Melange 1",
            description: "Polerón de alta calidad con diseño Shooters Ultra.",
            price: 49990,
            categoryName: "Polerones",
            images: ["https://bvnggvng.cl/cdn/shop/files/poleron-shooters-ultra-melange-8850734.png?v=1764237486&width=713"],
            sizes: textileSizes,
        },
        {
            name: "Polerón Shooters Ultra Melange 2",
            description: "Polerón premium Shooters Ultra Melange.",
            price: 54990,
            categoryName: "Polerones",
            images: ["https://bvnggvng.cl/cdn/shop/files/poleron-shooters-ultra-melange-9724002.png?v=1764237486&width=1100"],
            sizes: textileSizes,
        },
        {
            name: "Polera 50 Cent BG",
            description: "Polera exclusiva 50 Cent Bang Gang.",
            price: 24990,
            categoryName: "Poleras",
            images: ["https://bvnggvng.cl/cdn/shop/files/polera-50-cent-bg-28155442.png?v=1751168483&width=713"],
            sizes: textileSizes,
        },
        {
            name: "Polera Eminem BG",
            description: "Polera tributo a Eminem Bang Gang.",
            price: 24990,
            categoryName: "Poleras",
            images: ["https://bvnggvng.cl/cdn/shop/files/polera-eminem-bg-71552354.png?v=1751168485&width=713"],
            sizes: textileSizes,
        },
        {
            name: "Polera Ice Cube BG",
            description: "Polera Ice Cube Bang Gang.",
            price: 24990,
            categoryName: "Poleras",
            images: ["https://bvnggvng.cl/cdn/shop/files/polera-ice-cube-bg-50274641.png?v=1751168484&width=713"],
            sizes: textileSizes,
        },
        {
            name: "Polera Mystery",
            description: "Polera misteriosa de la colección Bang Gang.",
            price: 19990,
            categoryName: "Poleras",
            images: ["https://bvnggvng.cl/cdn/shop/files/polera-mystery-7988522.jpg?v=1751074333&width=713"],
            sizes: textileSizes,
        },
        {
            name: "Lente Bang Gang Negro",
            description: "Lentes con estilo Bang Gang en color negro.",
            price: 15990,
            categoryName: "Lentes",
            images: ["https://bvnggvng.cl/cdn/shop/files/lente-bang-gang-negro-9610128.png?v=1757947882&width=823"],
            sizes: accessorySizes,
        },
        {
            name: "Lente Bang Gang Blanco",
            description: "Lentes con estilo Bang Gang en color blanco.",
            price: 15990,
            categoryName: "Lentes",
            images: ["https://bvnggvng.cl/cdn/shop/files/lente-bang-gang-blanco-8187847.png?v=1757947882"],
            sizes: accessorySizes,
        },
    ];

    const productRecords: any[] = [];
    for (const productInfo of productsDataBase) {
        const slug = slugify(productInfo.name, { lower: true, strict: true });
        const product = await prisma.product.upsert({
            where: { slug: slug },
            update: {
                price: productInfo.price,
            },
            create: {
                name: productInfo.name,
                description: productInfo.description,
                price: productInfo.price,
                slug: slug,
                isPublished: true,
                categoryId: categoryMap[productInfo.categoryName],
                images: {
                    create: productInfo.images.map((url) => ({ url })),
                },
                variants: {
                    create: productInfo.sizes.map((size) => ({
                        size: size,
                        stock: 50, // Fixed stock for simplicity
                    })),
                },
            },
            include: { variants: true },
        });
        productRecords.push(product);
    }

    // 5. Seed Orders for Clients
    console.log("Seeding orders...");
    const orderStatuses = [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.PENDING];

    for (const user of userRecords) {
        if (user.role !== Role.CLIENT) continue;

        // Create 2-3 orders per client
        const numOrders = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < numOrders; i++) {
            const product = productRecords[Math.floor(Math.random() * productRecords.length)];
            const variant = product.variants[Math.floor(Math.random() * product.variants.length)];
            const quantity = Math.floor(Math.random() * 2) + 1;
            const total = product.price * quantity;
            const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

            await prisma.order.create({
                data: {
                    userId: user.id,
                    total: total,
                    subtotal: total,
                    shippingCost: 0,
                    taxes: 0,
                    taxRate: 0,
                    status: status,
                    isPaid: status !== OrderStatus.PENDING && status !== OrderStatus.CANCELLED,
                    date: new Date(),
                    customerName: user.name,
                    customerEmail: user.email,
                    customerPhone: user.phone,
                    shippingAddressId: `addr-${user.id}`,
                    billingAddressId: `addr-${user.id}`,
                    shippingName: user.name,
                    shippingStreet: "Avenida Siempreviva 123",
                    shippingComuna: "Santiago",
                    shippingRegion: "Metropolitana",
                    billingName: user.name,
                    billingStreet: "Avenida Siempreviva 123",
                    billingComuna: "Santiago",
                    billingRegion: "Metropolitana",
                    items: {
                        create: {
                            productId: product.id,
                            quantity: quantity,
                            price: product.price,
                            size: variant.size,
                        }
                    }
                }
            });
        }
        console.log(`- Created orders for client: ${user.name}`);
    }

    console.log("Seed finished successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
