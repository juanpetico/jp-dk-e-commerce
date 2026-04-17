import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { sendReviewRequestEmail } from "../../email/use-cases/send-review-request.js";

export const notifyReviewRequestUseCase = async (orderId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: { select: { id: true, email: true, name: true, isActive: true } },
            items: {
                include: {
                    product: {
                        include: { images: { take: 1 } },
                    },
                },
            },
        },
    });

    if (!order) throw new AppError("Order not found", 404);
    if (!order.user || !order.user.email) throw new AppError("Order has no associated user", 400);
    if (!order.user.isActive) throw new AppError("User is not active", 400);
    if (order.status !== "DELIVERED") throw new AppError("Order is not DELIVERED", 400);
    if (order.reviewRequestedAt) throw new AppError("Review already requested for this order", 409);

    await sendReviewRequestEmail({
        orderId: order.id,
        userName: order.user.name ?? "Cliente",
        userEmail: order.user.email,
        items: order.items.map((item) => ({
            productName: item.product.name,
            productSlug: item.product.slug,
            imageUrl: item.product.images[0]?.url ?? null,
        })),
    });

    return prisma.order.update({
        where: { id: orderId },
        data: { reviewRequestedAt: new Date() },
    });
};
