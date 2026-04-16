import prisma from "../../../config/prisma.js";
import { createLog } from "../../audit.service.js";
import { buildConfigAuditDiff } from "../shop-config.utils.js";
import type { UpdateConfigData } from "../shop-config.types.js";
import { getConfigUseCase } from "./get-config.js";
import { syncAutomatedCouponUseCase } from "./sync-automated-coupon.js";

export const updateConfigUseCase = async (actorId: string, data: UpdateConfigData) => {
    const currentConfig = await getConfigUseCase();

    const config = await prisma.storeConfig.update({
        where: { id: "default" },
        data,
    });

    if (data.welcomeCouponCode && currentConfig.welcomeCouponCode !== data.welcomeCouponCode) {
        await prisma.coupon.updateMany({
            where: { code: currentConfig.welcomeCouponCode.toUpperCase() },
            data: { isActive: false },
        });
    }

    if (data.vipCouponCode && currentConfig.vipCouponCode !== data.vipCouponCode) {
        await prisma.coupon.updateMany({
            where: { code: currentConfig.vipCouponCode.toUpperCase() },
            data: { isActive: false },
        });
    }

    if (config.welcomeCouponCode) {
        await syncAutomatedCouponUseCase({
            code: config.welcomeCouponCode,
            type: config.welcomeCouponType,
            value: config.welcomeCouponValue,
            description: "Cupón de bienvenida (Automático)",
        });
    }

    if (config.vipCouponCode) {
        await syncAutomatedCouponUseCase({
            code: config.vipCouponCode,
            type: config.vipCouponType,
            value: config.vipCouponValue,
            description: `Beneficio VIP (Gasto > $${config.vipThreshold.toLocaleString("es-CL")})`,
        });
    }

    const { oldValues, newValues } = buildConfigAuditDiff(currentConfig as unknown as Record<string, unknown>, data);

    if (Object.keys(oldValues).length > 0) {
        await createLog({
            actorId,
            action: "STORE_CONFIG_CHANGE",
            entityType: "STORE_CONFIG",
            entityId: "default",
            oldValue: JSON.stringify(oldValues),
            newValue: JSON.stringify(newValues),
        });
    }

    return config;
};
