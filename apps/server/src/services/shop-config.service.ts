import prisma from "../config/prisma.js";
import { couponService } from "./coupon.service.js";

export const shopConfigService = {
    async getConfig() {
        let config = await prisma.storeConfig.findUnique({
            where: { id: "default" },
        });

        if (!config) {
            config = await prisma.storeConfig.create({
                data: {
                    id: "default",
                },
            });
        }

        return config;
    },

    async updateConfig(data: {
        welcomeCouponCode?: string;
        welcomeCouponType?: any;
        welcomeCouponValue?: number;
        vipThreshold?: number;
        vipCouponCode?: string;
        vipCouponType?: any;
        vipCouponValue?: number;
        vipRewardMessage?: string;
    }) {
        // Fetch current config to check for code changes
        const currentConfig = await this.getConfig();

        const config = await prisma.storeConfig.update({
            where: { id: "default" },
            data,
        });

        // If welcome code changed, deactivate old one
        if (data.welcomeCouponCode && currentConfig.welcomeCouponCode !== data.welcomeCouponCode) {
            await prisma.coupon.updateMany({
                where: { code: currentConfig.welcomeCouponCode.toUpperCase() },
                data: { isActive: false }
            });
        }

        // If VIP code changed, deactivate old one
        if (data.vipCouponCode && currentConfig.vipCouponCode !== data.vipCouponCode) {
            await prisma.coupon.updateMany({
                where: { code: currentConfig.vipCouponCode.toUpperCase() },
                data: { isActive: false }
            });
        }

        if (config.welcomeCouponCode) {
            await this.syncAutomatedCoupon({
                code: config.welcomeCouponCode,
                type: config.welcomeCouponType,
                value: config.welcomeCouponValue,
                description: "Cupón de bienvenida (Automático)"
            });
        }

        if (config.vipCouponCode) {
            await this.syncAutomatedCoupon({
                code: config.vipCouponCode,
                type: config.vipCouponType,
                value: config.vipCouponValue,
                description: `Beneficio VIP (Gasto > $${config.vipThreshold.toLocaleString('es-CL')})`
            });
        }

        return config;
    },

    async syncAutomatedCoupon(data: { code: string, type: any, value: number, description: string }) {
        const existing = await prisma.coupon.findUnique({
            where: { code: data.code.toUpperCase() }
        });

        if (existing) {
            await prisma.coupon.update({
                where: { id: existing.id },
                data: {
                    type: data.type,
                    value: data.value,
                    description: data.description,
                    isActive: true,
                    isPublic: false
                }
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
                }
            });
        }
    },

    async syncConfigFromCoupon(coupon: any, oldCode?: string) {
        const config = await this.getConfig();
        const updates: any = {};
        const normalizedOldCode = oldCode?.toUpperCase();
        const normalizedNewCode = coupon.code.toUpperCase();

        // Check if this coupon corresponds to any automated coupon by its NEW code or OLD code
        const isWelcome = (config.welcomeCouponCode && normalizedNewCode === config.welcomeCouponCode.toUpperCase()) ||
            (normalizedOldCode && config.welcomeCouponCode && normalizedOldCode === config.welcomeCouponCode.toUpperCase());

        const isVip = (config.vipCouponCode && normalizedNewCode === config.vipCouponCode.toUpperCase()) ||
            (normalizedOldCode && config.vipCouponCode && normalizedOldCode === config.vipCouponCode.toUpperCase());

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
                data: updates
            });
        }
    }
};
