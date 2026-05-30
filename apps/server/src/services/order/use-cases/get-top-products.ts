import prisma from "../../../config/prisma.js";

export interface TopProduct {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string | null;
    totalQuantitySold: number;
    totalRevenue: number;
    category: {
        id: string;
        name: string;
    };
}

export const getTopProductsUseCase = async (limit: number = 5, startDate?: Date, endDate?: Date): Promise<TopProduct[]> => {
    const createdAtFilter = (startDate || endDate)
        ? {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
        }
        : undefined;

    const topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
            order: {
                status: {
                    not: 'CANCELLED'
                },
                ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
            }
        },
        _sum: {
            quantity: true
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: limit
    });

    const productIds = topProducts.map(item => item.productId);
    
    const products = await prisma.product.findMany({
        where: {
            id: {
                in: productIds
            }
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            },
            images: {
                select: {
                    url: true
                },
                take: 1
            }
        }
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    return topProducts
        .map(item => {
            const product = productMap.get(item.productId);
            if (!product) return null;

            const qty = item._sum.quantity ?? 0;
            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                imageUrl: product.images[0]?.url ?? null,
                totalQuantitySold: qty,
                totalRevenue: qty * product.price,
                category: {
                    id: product.category.id,
                    name: product.category.name
                }
            };
        })
        .filter((p): p is TopProduct => p !== null);
};
