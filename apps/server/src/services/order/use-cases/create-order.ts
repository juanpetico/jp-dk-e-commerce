import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { couponService } from "../../coupon.service.js";
import { shopConfigService } from "../../shop-config.service.js";
import type { OrderItemInput } from "../order.types.js";

export const createOrderUseCase = async (
    userId: string,
    items: OrderItemInput[],
    shippingAddressId?: string,
    billingAddressId?: string,
    couponCode?: string
) => {
    if (!items || items.length === 0) {
        throw new AppError("Order must contain at least one item", 400);
    }

    return prisma.$transaction(async (tx: any) => {
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

        const netAmount = total - discountAmount;
        const taxRate = 0;
        const taxes = 0;
        const shopConfig = await shopConfigService.getConfig();
        const qualifiesForFreeShipping =
            shopConfig.freeShippingThreshold > 0 && total >= shopConfig.freeShippingThreshold;
        const shippingCost = qualifiesForFreeShipping ? 0 : shopConfig.baseShippingCost;
        const finalTotal = netAmount + shippingCost;

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

        return {
            ...newOrder,
            earnedCoupon,
        };
    });
};
