import { AppError } from "../../middleware/error-handler.js";
import { couponService } from "../coupon.service.js";
import type { OrderItemInput } from "./order.types.js";

export const assertOrderItems = (items: OrderItemInput[]) => {
    if (!items || items.length === 0) {
        throw new AppError("Order must contain at least one item", 400);
    }
};

export const processOrderItems = async (tx: any, items: OrderItemInput[]) => {
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
        const product = await tx.product.findUnique({
            where: { id: item.productId },
            include: { variants: true },
        });

        if (!product) {
            throw new AppError(`Product ${item.productId} not found`, 404);
        }

        const variant = product.variants.find((v: any) => v.size === item.size);

        if (!variant) {
            throw new AppError(`Size ${item.size} not available for ${product.name}`, 400);
        }

        if (variant.stock < item.quantity) {
            throw new AppError(
                `Insufficient stock for ${product.name} (Size: ${item.size}). Available: ${variant.stock}`,
                400
            );
        }

        await tx.productVariant.update({
            where: {
                productId_size: {
                    productId: item.productId,
                    size: item.size,
                },
            },
            data: {
                stock: {
                    decrement: item.quantity,
                },
            },
        });

        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        orderItemsData.push({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            price: product.price,
        });
    }

    return { total, orderItemsData };
};

export const applyCouponToOrder = async (
    tx: any,
    userId: string,
    total: number,
    couponCode?: string
) => {
    let discountAmount = 0;
    let couponId: string | undefined = undefined;

    if (couponCode) {
        const coupon = await couponService.validateCoupon(couponCode, userId, total, tx);

        if (coupon.type === "PERCENTAGE") {
            discountAmount = Math.round(total * (coupon.value / 100));
        } else if (coupon.type === "FIXED_AMOUNT") {
            discountAmount = Math.min(coupon.value, total);
        }

        couponId = coupon.id;

        await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
        });

        await tx.userCoupon.updateMany({
            where: {
                userId,
                couponId: coupon.id,
                isUsed: false,
            },
            data: {
                isUsed: true,
                usedAt: new Date(),
            },
        });
    }

    return { discountAmount, couponId };
};

export const calculateOrderTotals = (
    total: number,
    discountAmount: number,
    shopConfig: { freeShippingThreshold: number; baseShippingCost: number }
) => {
    const netAmount = total - discountAmount;
    const taxRate = 0;
    const taxes = 0;
    const qualifiesForFreeShipping =
        shopConfig.freeShippingThreshold > 0 && total >= shopConfig.freeShippingThreshold;
    const shippingCost = qualifiesForFreeShipping ? 0 : shopConfig.baseShippingCost;
    const finalTotal = netAmount + shippingCost;

    return {
        netAmount,
        taxRate,
        taxes,
        shippingCost,
        finalTotal,
    };
};

export const resolveOrderAddresses = async (
    tx: any,
    userId: string,
    shippingAddressId?: string,
    billingAddressId?: string
) => {
    const user = await tx.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const userAddresses = await tx.address.findMany({
        where: { userId, isActive: true },
    });

    if (userAddresses.length === 0) {
        throw new AppError("User must have at least one address to create an order", 400);
    }

    const shippingAddr = shippingAddressId
        ? userAddresses.find((a: any) => a.id === shippingAddressId)
        : userAddresses.find((a: any) => a.isDefault) || userAddresses[0];

    const billingAddr = billingAddressId
        ? userAddresses.find((a: any) => a.id === billingAddressId)
        : shippingAddr;

    if (!shippingAddr) throw new AppError("Shipping address not found", 400);
    if (!billingAddr) throw new AppError("Billing address not found", 400);

    return { user, shippingAddr, billingAddr };
};

export const maybeAssignVipCoupon = async (
    tx: any,
    userId: string,
    total: number,
    shopConfig: { vipThreshold: number; vipCouponCode: string; vipRewardMessage: string }
) => {
    let earnedCoupon = null;

    if (total >= shopConfig.vipThreshold) {
        const result = await couponService.assignCouponToUser(userId, shopConfig.vipCouponCode, tx);
        if (result?.isNew) {
            earnedCoupon = {
                code: shopConfig.vipCouponCode,
                message: shopConfig.vipRewardMessage,
            };
        }
    }

    return earnedCoupon;
};
