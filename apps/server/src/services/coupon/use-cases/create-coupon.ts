import prisma from "../../../config/prisma.js";
import { createLog } from "../../audit.service.js";
import type { CreateCouponData } from "../coupon.types.js";
import { normalizeCouponEndDate, normalizeCouponStartDate } from "../coupon.utils.js";

export const createCouponUseCase = async (data: CreateCouponData, actorId: string) => {
    const startDate = normalizeCouponStartDate(data.startDate);
    const normalizedEndDate = normalizeCouponEndDate(data.endDate);

    const coupon = await prisma.coupon.create({
        data: {
            ...data,
            startDate,
            ...(normalizedEndDate !== undefined ? { endDate: normalizedEndDate } : {}),
        },
    });

    await createLog({
        actorId,
        action: "COUPON_CREATED",
        entityType: "COUPON",
        entityId: coupon.id,
        newValue: coupon.code,
        metadata: { description: coupon.description, type: coupon.type, value: coupon.value },
    });

    return coupon;
};
