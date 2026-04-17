import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { sendAbandonedCartEmail } from "../../email/use-cases/send-abandoned-cart.js";

export const notifyAbandonedCartUseCase = async (cartId: string) => {
    const cart = await prisma.cart.findUnique({
        where: { id: cartId },
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

    if (!cart) throw new AppError("Cart not found", 404);
    if (!cart.user || !cart.user.email) throw new AppError("Cart has no associated user", 400);
    if (!cart.user.isActive) throw new AppError("User is not active", 400);
    if (cart.items.length === 0) throw new AppError("Cart is empty", 400);
    if (cart.reminderSentAt) throw new AppError("Reminder already sent for this cart", 409);

    const totalAmount = cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    await sendAbandonedCartEmail({
        userName: cart.user.name ?? "Cliente",
        userEmail: cart.user.email,
        totalAmount,
        items: cart.items.map((item) => ({
            productName: item.product.name,
            productSlug: item.product.slug,
            imageUrl: item.product.images[0]?.url ?? null,
            size: item.size,
            quantity: item.quantity,
            price: item.product.price,
        })),
    });

    return prisma.cart.update({
        where: { id: cartId },
        data: { reminderSentAt: new Date() },
    });
};
