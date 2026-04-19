import prisma from "../../../config/prisma.js";
import type { OrderItemInput } from "../order.types.js";
import {
    applyCouponToOrder,
    assertOrderItems,
    calculateOrderTotals,
    maybeAssignVipCoupon,
    processOrderItems,
    resolveOrderAddresses,
} from "../create-order.helpers.js";
import { shopConfigService } from "../../shop-config.service.js";

export const createOrderUseCase = async (
    userId: string,
    items: OrderItemInput[],
    shippingAddressId?: string,
    billingAddressId?: string,
    couponCode?: string
) => {
    assertOrderItems(items);

    // Fetch config before the transaction to avoid a second connection from the pool
    // (max: 1 on Vercel — using prisma inside $transaction would deadlock)
    const shopConfig = await shopConfigService.getConfig();

    return prisma.$transaction(async (tx: any) => {
        const { total, orderItemsData } = await processOrderItems(tx, items);
        const { discountAmount, couponId } = await applyCouponToOrder(tx, userId, total, couponCode);
        const { taxes, taxRate, shippingCost, finalTotal } = calculateOrderTotals(total, discountAmount, shopConfig);
        const { user, shippingAddr, billingAddr } = await resolveOrderAddresses(tx, userId, shippingAddressId, billingAddressId);

        const newOrder = await tx.order.create({
            data: {
                userId,
                date: new Date(),
                total: finalTotal,
                subtotal: total,
                discountAmount,
                couponId,
                shippingCost,
                taxes,
                taxRate,
                status: "PENDING",
                isPaid: false,
                shippingAddressId: shippingAddr.id,
                billingAddressId: billingAddr.id,
                customerName: user.name,
                customerEmail: user.email,
                customerPhone: user.phone,
                shippingName: shippingAddr.name,
                shippingRut: shippingAddr.rut,
                shippingStreet: shippingAddr.street,
                shippingComuna: shippingAddr.comuna,
                shippingRegion: shippingAddr.region,
                shippingZipCode: shippingAddr.zipCode,
                shippingPhone: shippingAddr.phone,
                billingName: billingAddr.name,
                billingRut: billingAddr.rut,
                billingStreet: billingAddr.street,
                billingComuna: billingAddr.comuna,
                billingRegion: billingAddr.region,
                billingZipCode: billingAddr.zipCode,
                billingPhone: billingAddr.phone,
                billingCompany: billingAddr.company,
                items: {
                    create: orderItemsData,
                },
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                category: true,
                                variants: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                    },
                },
                coupon: true,
            },
        });

        const earnedCoupon = await maybeAssignVipCoupon(tx, userId, total, shopConfig);

        return {
            ...newOrder,
            earnedCoupon,
        };
    });
};
