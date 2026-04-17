import { SettingsForm } from './SettingsPage.types';

export const formatThousandsCL = (value: number | string) => {
    const digits = String(value).replace(/\D/g, '');
    if (!digits) return '';
    return new Intl.NumberFormat('es-CL').format(Number(digits));
};

export const parseThousandsCL = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits ? Number(digits) : 0;
};

export const validateSettingsForm = (form: SettingsForm): Record<string, string> => {
    const errors: Record<string, string> = {};
    const baseShippingCost = parseThousandsCL(form.baseShippingCost);
    const freeShippingThreshold = parseThousandsCL(form.freeShippingThreshold);

    if (!form.storeName.trim()) errors.storeName = 'Requerido';
    if (!/^\S+@\S+\.\S+$/.test(form.supportEmail)) errors.supportEmail = 'Email inválido';
    if (!Number.isFinite(baseShippingCost) || baseShippingCost < 0) {
        errors.baseShippingCost = 'Debe ser >= 0';
    }
    if (!Number.isFinite(freeShippingThreshold) || freeShippingThreshold < 0) {
        errors.freeShippingThreshold = 'Debe ser >= 0';
    }

    return errors;
};
