import prisma from "../config/prisma.js";
import { createLog } from "./audit.service.js";

// Fields that are interesting enough to audit when changed
const AUDITABLE_CONFIG_FIELDS = [
    "freeShippingThreshold",
    "baseShippingCost",
    "defaultTaxRate",
    "lowStockThreshold",
    "vipThreshold",
    "vipCouponCode",
    "vipCouponType",
    "vipCouponValue",
    "vipRewardMessage",
    "welcomeCouponCode",
    "welcomeCouponType",
    "welcomeCouponValue",
] as const;

type AuditableField = (typeof AUDITABLE_CONFIG_FIELDS)[number];

export interface UpdateConfigData {
    welcomeCouponCode?: string;
    welcomeCouponType?: any;
    welcomeCouponValue?: number;
    vipThreshold?: number;
    vipCouponCode?: string;
    vipCouponType?: any;
    vipCouponValue?: number;
    vipRewardMessage?: string;
    freeShippingThreshold?: number;
    baseShippingCost?: number;
    defaultTaxRate?: number;
    lowStockThreshold?: number;
}

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

    async updateConfig(actorId: string, data: UpdateConfigData) {
        const currentConfig = await this.getConfig();

        const config = await prisma.storeConfig.update({
            where: { id: "default" },
            data,
        });

        // Deactivate old automated coupon codes if they changed
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
            await this.syncAutomatedCoupon({
                code: config.welcomeCouponCode,
                type: config.welcomeCouponType,
                value: config.welcomeCouponValue,
                description: "Cupón de bienvenida (Automático)",
            });
        }

        if (config.vipCouponCode) {
            await this.syncAutomatedCoupon({
                code: config.vipCouponCode,
                type: config.vipCouponType,
                value: config.vipCouponValue,
                description: `Beneficio VIP (Gasto > $${config.vipThreshold.toLocaleString("es-CL")})`,
            });
        }

        // Audit: compute diff over auditable fields
        const oldValues: Partial<Record<AuditableField, unknown>> = {};
        const newValues: Partial<Record<AuditableField, unknown>> = {};

        for (const field of AUDITABLE_CONFIG_FIELDS) {
            const incoming = (data as Record<string, unknown>)[field];
            if (incoming !== undefined && currentConfig[field] !== incoming) {
                oldValues[field] = currentConfig[field];
                newValues[field] = incoming;
            }
        }

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
    },

    async syncAutomatedCoupon(data: {
        code: string;
        type: any;
        value: number;
        description: string;
    }) {
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
    },

    async syncConfigFromCoupon(coupon: any, oldCode?: string) {
        const config = await this.getConfig();
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
    },
};
