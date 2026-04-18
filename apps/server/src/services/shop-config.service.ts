import { getConfigUseCase } from "./shop-config/use-cases/get-config.js";
import { syncAutomatedCouponUseCase } from "./shop-config/use-cases/sync-automated-coupon.js";
import { syncConfigFromCouponUseCase } from "./shop-config/use-cases/sync-config-from-coupon.js";
import { updateConfigUseCase } from "./shop-config/use-cases/update-config.js";
import type { AutomatedCouponInput, UpdateConfigData } from "./shop-config/shop-config.types.js";

export type { UpdateConfigData };

export const shopConfigService = {
    async getConfig() {
        return getConfigUseCase();
    },

    async updateConfig(actorId: string, data: UpdateConfigData) {
        return updateConfigUseCase(actorId, data);
    },

    async syncAutomatedCoupon(data: AutomatedCouponInput) {
        return syncAutomatedCouponUseCase(data);
    },

    async syncConfigFromCoupon(coupon: any, oldCode?: string) {
        return syncConfigFromCouponUseCase(coupon, oldCode);
    },
};
