import { StoreConfig } from '@/services/shopConfigService';

export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface TriggersConfigFormData {
    welcomeCouponCode: string;
    welcomeCouponType: CouponType;
    welcomeCouponValue: number;
    vipThreshold: number;
    vipCouponCode: string;
    vipCouponType: CouponType;
    vipCouponValue: number;
    vipRewardMessage: string;
}

export interface TriggersConfirmDialogState {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
}

export const mapConfigToFormData = (config: StoreConfig): TriggersConfigFormData => ({
    welcomeCouponCode: config.welcomeCouponCode,
    welcomeCouponType: config.welcomeCouponType || 'PERCENTAGE',
    welcomeCouponValue: config.welcomeCouponValue || 0,
    vipThreshold: config.vipThreshold,
    vipCouponCode: config.vipCouponCode,
    vipCouponType: config.vipCouponType || 'PERCENTAGE',
    vipCouponValue: config.vipCouponValue || 0,
    vipRewardMessage: config.vipRewardMessage,
});
