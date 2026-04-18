import prisma from "../../../config/prisma.js";
import { shopConfigService } from "../../shop-config.service.js";
import { createLog } from "../../audit.service.js";
import type { CouponMutationData } from "../coupon.types.js";
import { normalizeCouponEndDate, normalizeCouponStartDate } from "../coupon.utils.js";

export const updateCouponUseCase = async (id: string, data: CouponMutationData, actorId: string) => {
    const updateData: Record<string, unknown> = { ...data };

    if (data.startDate) {
        updateData.startDate = normalizeCouponStartDate(data.startDate);
    }

    if (data.endDate !== undefined) {
        const normalizedEndDate = normalizeCouponEndDate(data.endDate);
        if (normalizedEndDate !== undefined) {
            updateData.endDate = normalizedEndDate;
        }
    }

    const oldCoupon = await prisma.coupon.findUnique({ where: { id } });

    const coupon = await prisma.coupon.update({
        where: { id },
        data: updateData,
    });

    await shopConfigService.syncConfigFromCoupon(coupon, oldCoupon?.code);

    if (oldCoupon) {
        const TRACKED = ["code", "value", "type", "isActive", "description", "minAmount", "maxUses", "isPublic"] as const;
        const oldFields: Record<string, unknown> = {};
        const newFields: Record<string, unknown> = {};
        for (const key of TRACKED) {
            if (String(oldCoupon[key]) !== String(coupon[key])) {
                oldFields[key] = oldCoupon[key];
                newFields[key] = coupon[key];
            }
        }
        if (Object.keys(newFields).length > 0) {
            await createLog({
                actorId,
                action: "COUPON_UPDATED",
                entityType: "COUPON",
                entityId: coupon.id,
                oldValue: JSON.stringify(oldFields),
                newValue: JSON.stringify(newFields),
                metadata: { couponCode: coupon.code },
            });
        }
    }

    return coupon;
};
