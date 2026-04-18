import prisma from "../../../config/prisma.js";
import { orderWithAddressesInclude } from "../order.queries.js";
import { sendOrderReceiptEmail } from "../../email/use-cases/send-order-receipt.js";

export const markOrderAsPaidUseCase = async (orderId: string) => {
    const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            isPaid: true,
            paidAt: new Date(),
            status: "CONFIRMED",
        },
        include: orderWithAddressesInclude,
    });

    if (order.customerEmail) {
        void sendOrderReceiptEmail({
            orderId: order.id,
            customerName: order.customerName ?? "Cliente",
            customerEmail: order.customerEmail,
            items: order.items.map((item) => ({
                productName: item.product.name,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
            })),
            subtotal: order.subtotal,
            discountAmount: order.discountAmount,
            shippingCost: order.shippingCost,
            taxes: order.taxes,
            total: order.total,
            couponCode: order.coupon?.code,
            shippingStreet: order.shippingStreet ?? order.shippingAddress.street,
            shippingComuna: order.shippingComuna ?? order.shippingAddress.comuna,
            shippingRegion: order.shippingRegion ?? order.shippingAddress.region,
        });
    }

    return order;
};
