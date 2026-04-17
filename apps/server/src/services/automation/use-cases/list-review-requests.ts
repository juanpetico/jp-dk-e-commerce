import prisma from "../../../config/prisma.js";
import type { ReviewRequestDto } from "../automation.types.js";

interface Params {
    daysSinceDelivery: number;
    limit: number;
}

export const listReviewRequestsUseCase = async ({
    daysSinceDelivery,
    limit,
}: Params): Promise<ReviewRequestDto[]> => {
    const threshold = new Date(Date.now() - daysSinceDelivery * 24 * 60 * 60 * 1000);

    // Usamos confirmedAt como proxy de "entregado" cuando el status es DELIVERED.
    // Si no hay confirmedAt, caemos a updatedAt.
    const orders = await prisma.order.findMany({
        where: {
            status: "DELIVERED",
            reviewRequestedAt: null,
            isPaid: true,
            updatedAt: { lt: threshold },
            user: { isActive: true },
        },
        include: {
            user: { select: { id: true, email: true, name: true } },
            items: {
                include: {
                    product: {
                        include: { images: { take: 1 } },
                    },
                },
            },
        },
        orderBy: { updatedAt: "asc" },
        take: limit,
    });

    return orders
        .filter((o) => o.user && o.user.email)
        .map((order) => ({
            orderId: order.id,
            userId: order.user.id,
            userName: order.user.name,
            userEmail: order.user.email,
            deliveredAt: order.confirmedAt ?? order.updatedAt,
            items: order.items.map((item) => ({
                productId: item.productId,
                productName: item.product.name,
                productSlug: item.product.slug,
                imageUrl: item.product.images[0]?.url ?? null,
            })),
        }));
};
