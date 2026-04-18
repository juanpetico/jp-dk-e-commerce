import prisma from "../../../config/prisma.js";
import type { AutomatedCouponInput } from "../shop-config.types.js";

export const syncAutomatedCouponUseCase = async (data: AutomatedCouponInput) => {
    const existing = await prisma.coupon.findUnique({
        where: { code: data.code.toUpperCase() },
    });

    if (existing) {
        await prisma.coupon.update({
            where: { id: existing.id },
            data: {
                type: data.type,
                value: data.value,
                description: data.description,
                isActive: true,
                isPublic: false,
            },
        });
    } else {
        await prisma.coupon.create({
            data: {
                code: data.code.toUpperCase(),
                type: data.type,
                value: data.value,
                description: data.description,
                isActive: true,
                isPublic: false,
                maxUsesPerUser: 1,
                startDate: new Date(),
            },
        });
    }
};
