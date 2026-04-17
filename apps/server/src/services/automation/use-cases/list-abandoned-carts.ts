import prisma from "../../../config/prisma.js";
import type { AbandonedCartDto } from "../automation.types.js";

interface Params {
    hoursInactive: number;
    limit: number;
}

export const listAbandonedCartsUseCase = async ({ hoursInactive, limit }: Params): Promise<AbandonedCartDto[]> => {
    const threshold = new Date(Date.now() - hoursInactive * 60 * 60 * 1000);

    const carts = await prisma.cart.findMany({
        where: {
            reminderSentAt: null,
            updatedAt: { lt: threshold },
            userId: { not: null },
            user: { isActive: true },
            items: { some: {} },
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

    return carts
        .filter((cart) => cart.user !== null && cart.user.email)
        .map((cart) => {
            const totalAmount = cart.items.reduce(
                (sum, item) => sum + item.product.price * item.quantity,
                0
            );
            return {
                cartId: cart.id,
                userId: cart.user!.id,
                userName: cart.user!.name,
                userEmail: cart.user!.email,
                updatedAt: cart.updatedAt,
                itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
                totalAmount,
                items: cart.items.map((item) => ({
                    productId: item.productId,
                    productName: item.product.name,
                    productSlug: item.product.slug,
                    imageUrl: item.product.images[0]?.url ?? null,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
            };
        });
};
