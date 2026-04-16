import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Coupon, DiscountType } from '../../../types';

interface UseCouponFormProps {
    isOpen: boolean;
    initialData?: Coupon | null;
    automationType?: 'WELCOME' | 'VIP' | null;
    vipConfig?: { threshold: number; message: string };
    onSave: (coupon: Partial<Coupon> & { vipThreshold?: number; vipRewardMessage?: string }) => Promise<void>;
    onClose: () => void;
}

const makeDefaultFormData = () => ({
    code: '',
    description: '',
    type: 'PERCENTAGE' as DiscountType,
    value: 0 as number | null,
    minAmount: 0 as number | null,
    maxUses: null as number | null,
    maxUsesPerUser: 1,
    startDate: new Date().toISOString().split('T')[0] || '',
    endDate: '',
    isActive: true,
    vipThreshold: 0,
    vipRewardMessage: ''
});

export function useCouponForm({ isOpen, initialData, automationType, vipConfig, onSave, onClose }: UseCouponFormProps) {
    const [formData, setFormData] = useState(makeDefaultFormData());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => {}
    });

    const formatNumber = (val: number | string | null | undefined) => {
        if (val === undefined || val === null || val === '') return '';
        const parts = val.toString().split('.');
        if (parts[0]) {
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
        return parts.join(',');
    };

    const parseNumber = (val: string) => {
        const clean = val.replace(/\./g, '').replace(',', '.');
        if (clean === '') return null;
        return parseFloat(clean) || 0;
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    code: initialData.code || '',
                    description: initialData.description || '',
                    type: initialData.type || 'PERCENTAGE',
                    value: initialData.value || 0,
                    minAmount: initialData.minAmount || 0,
                    maxUses: initialData.maxUses ?? null,
                    maxUsesPerUser: initialData.maxUsesPerUser || 1,
                    startDate: initialData.startDate ? (new Date(initialData.startDate).toISOString().split('T')[0] || '') : (new Date().toISOString().split('T')[0] || ''),
                    endDate: initialData.endDate ? (new Date(initialData.endDate).toISOString().split('T')[0] || '') : '',
                    isActive: initialData.isActive ?? true,
                    vipThreshold: vipConfig?.threshold || 0,
                    vipRewardMessage: vipConfig?.message || ''
                });
            } else {
                setFormData(makeDefaultFormData());
            }
            setErrors({});
        }
    }, [initialData, isOpen, vipConfig]);

    useEffect(() => {
        if (automationType === 'VIP' && formData.value) {
            const discountText = formData.type === 'PERCENTAGE'
                ? `${formData.value}%`
                : `$${formatNumber(formData.value)}`;

            let newMessage = formData.vipRewardMessage;
            const pattern = /(\d+(?:[.,]\d+)?\s*%|\$\s?[\d.,]+)/;

            if (!newMessage || !newMessage.trim()) {
                newMessage = `¡Felicidades! Has desbloqueado un cupón de ${discountText} de descuento por tus compras.`;
            } else if (newMessage.match(pattern)) {
                newMessage = newMessage.replace(pattern, discountText);
            }

            if (newMessage !== formData.vipRewardMessage) {
                setFormData(prev => ({ ...prev, vipRewardMessage: newMessage }));
            }
        }
    }, [formData.value, formData.type, automationType]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.code.trim()) newErrors.code = 'El código es requerido';
        else if (formData.code.length < 3) newErrors.code = 'Mínimo 3 caracteres';

        if ((formData.value ?? 0) <= 0) newErrors.value = 'Debe ser mayor a 0';
        if (formData.type === 'PERCENTAGE' && (formData.value ?? 0) > 100) newErrors.value = 'Máximo 100%';

        if ((formData.minAmount ?? 0) < 0) newErrors.minAmount = 'No puede ser negativo';

        if (formData.maxUses !== null && formData.maxUses <= 0) newErrors.maxUses = 'Debe ser mayor a 0';
        if (formData.maxUsesPerUser <= 0) newErrors.maxUsesPerUser = 'Mínimo 1 uso';

        if (!formData.startDate) newErrors.startDate = 'Requerida';

        if (automationType === 'VIP' && formData.vipThreshold <= 0) {
            newErrors.vipThreshold = 'Debe ser mayor a 0';
        }

        if (formData.endDate && formData.startDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end < start) newErrors.endDate = 'Debe ser posterior al inicio';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setConfirmDialog({
            isOpen: true,
            title: initialData ? '¿Guardar cambios?' : '¿Crear cupón?',
            description: initialData
                ? `Se actualizará la información del cupón "${formData.code}".`
                : `Se creará un nuevo cupón con el código "${formData.code}".`,
            onConfirm: performSave
        });
    };

    const performSave = async () => {
        setIsSaving(true);
        try {
            await onSave({
                ...formData,
                value: formData.value ?? 0,
                minAmount: formData.minAmount ?? 0,
                code: formData.code.toUpperCase().trim(),
                maxUses: formData.maxUses === 0 ? null : formData.maxUses,
                endDate: formData.endDate || null,
                vipThreshold: formData.vipThreshold,
                vipRewardMessage: formData.vipRewardMessage
            });
            onClose();
        } catch {
            toast.error('Error al guardar el cupón');
        } finally {
            setIsSaving(false);
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
    };

    return { formData, setFormData, errors, isSaving, confirmDialog, setConfirmDialog, handleSubmit, formatNumber, parseNumber };
}
