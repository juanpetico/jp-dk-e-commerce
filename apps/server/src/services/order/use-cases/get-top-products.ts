import prisma from "../../../config/prisma.js";

export interface TopProduct {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string | null;
    totalQuantitySold: number;
    category: {
        id: string;
        name: string;
    };
}

export const getTopProductsUseCase = async (limit: number = 5): Promise<TopProduct[]> => {
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
            order: {
                status: {
                    not: 'CANCELLED'
                },
                createdAt: {
                    gte: startDate
                }
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

            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                imageUrl: product.images[0]?.url ?? null,
                totalQuantitySold: item._sum.quantity ?? 0,
                category: {
                    id: product.category.id,
                    name: product.category.name
                }
            };
        })
        .filter((p): p is TopProduct => p !== null);
};
