import prisma from "../../../config/prisma.js";
import { getConfigUseCase } from "./get-config.js";

export const syncConfigFromCouponUseCase = async (coupon: any, oldCode?: string) => {
    const config = await getConfigUseCase();
    const updates: any = {};
    const normalizedOldCode = oldCode?.toUpperCase();
    const normalizedNewCode = coupon.code.toUpperCase();

    const isWelcome =
        (config.welcomeCouponCode &&
            normalizedNewCode === config.welcomeCouponCode.toUpperCase()) ||
        (normalizedOldCode &&
            config.welcomeCouponCode &&
            normalizedOldCode === config.welcomeCouponCode.toUpperCase());

    const isVip =
        (config.vipCouponCode &&
            normalizedNewCode === config.vipCouponCode.toUpperCase()) ||
        (normalizedOldCode &&
            config.vipCouponCode &&
            normalizedOldCode === config.vipCouponCode.toUpperCase());

    if (isWelcome) {
        updates.welcomeCouponType = coupon.type;
        updates.welcomeCouponValue = coupon.value;
        updates.welcomeCouponCode = coupon.code.toUpperCase();
    }

    if (isVip) {
        updates.vipCouponType = coupon.type;
        updates.vipCouponValue = coupon.value;
        updates.vipCouponCode = coupon.code.toUpperCase();
    }

    if (Object.keys(updates).length > 0) {
        await prisma.storeConfig.update({
            where: { id: "default" },
            data: updates,
        });
    }
};
