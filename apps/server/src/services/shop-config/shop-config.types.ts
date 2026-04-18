import type { AUDITABLE_CONFIG_FIELDS } from "./shop-config.constants.js";

export type AuditableField = (typeof AUDITABLE_CONFIG_FIELDS)[number];

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

export interface AutomatedCouponInput {
    code: string;
    type: any;
    value: number;
    description: string;
}
