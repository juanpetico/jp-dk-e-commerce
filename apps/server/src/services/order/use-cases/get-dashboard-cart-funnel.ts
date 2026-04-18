import prisma from "../../../config/prisma.js";

export interface DashboardCartFunnelMetrics {
    abandonedRate: number;
    abandonedCarts: number;
    eligibleCarts: number;
    potentialRevenue: number;
    hoursInactiveThreshold: number;
}

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const HOURS_24_IN_MS = 24 * 60 * 60 * 1000;

export const getDashboardCartFunnelUseCase = async (): Promise<DashboardCartFunnelMetrics> => {
    const now = Date.now();
    const weekStart = new Date(now - WEEK_IN_MS);
    const staleThreshold = new Date(now - HOURS_24_IN_MS);

    const eligibleCarts = await prisma.cart.findMany({
        where: {
            userId: { not: null },
            user: { isActive: true },
            items: { some: {} },
            updatedAt: {
                gte: weekStart,
                lte: staleThreshold,
            },
        },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            price: true,
                        },
                    },
                },
            },
        },
    });

    if (eligibleCarts.length === 0) {
        return {
            abandonedRate: 0,
            abandonedCarts: 0,
            eligibleCarts: 0,
            potentialRevenue: 0,
            hoursInactiveThreshold: 24,
        };
    }

    const userIds = Array.from(new Set(eligibleCarts.flatMap((cart) => (cart.userId ? [cart.userId] : []))));

    const orders = await prisma.order.findMany({
        where: {
            userId: { in: userIds },
            status: { not: "CANCELLED" },
            createdAt: { gte: weekStart },
        },
        select: {
            userId: true,
            createdAt: true,
        },
    });

    const ordersByUser = new Map<string, Date[]>();
    orders.forEach((order) => {
        const bucket = ordersByUser.get(order.userId) ?? [];
        bucket.push(order.createdAt);
        ordersByUser.set(order.userId, bucket);
    });

    let abandonedCarts = 0;
    let potentialRevenue = 0;

    eligibleCarts.forEach((cart) => {
        if (!cart.userId) return;

        const cartUpdatedAt = cart.updatedAt.getTime();
        const hasOrderAfterCart = (ordersByUser.get(cart.userId) ?? []).some(
            (orderDate) => orderDate.getTime() >= cartUpdatedAt
        );

        if (hasOrderAfterCart) return;

        abandonedCarts += 1;
        potentialRevenue += cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    });

    const abandonedRate = eligibleCarts.length > 0 ? (abandonedCarts / eligibleCarts.length) * 100 : 0;

    return {
        abandonedRate,
        abandonedCarts,
        eligibleCarts: eligibleCarts.length,
        potentialRevenue,
        hoursInactiveThreshold: 24,
    };
};
