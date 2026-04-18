'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { shopConfigService, StoreConfig } from '@/services/shopConfigService';
import {
    CouponType,
    TriggersConfirmDialogState,
    TriggersConfigFormData,
    mapConfigToFormData,
} from './TriggersConfigCard.types';

const INITIAL_FORM_DATA: TriggersConfigFormData = {
    welcomeCouponCode: '',
    welcomeCouponType: 'PERCENTAGE',
    welcomeCouponValue: 0,
    vipThreshold: 0,
    vipCouponCode: '',
    vipCouponType: 'PERCENTAGE',
    vipCouponValue: 0,
    vipRewardMessage: '',
};

const INITIAL_CONFIRM_STATE: TriggersConfirmDialogState = {
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => { },
};

export function useTriggersConfigForm() {
    const [config, setConfig] = useState<StoreConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<TriggersConfigFormData>(INITIAL_FORM_DATA);
    const [confirmDialog, setConfirmDialog] = useState<TriggersConfirmDialogState>(INITIAL_CONFIRM_STATE);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await shopConfigService.getConfig();
                setConfig(data);
                setFormData(mapConfigToFormData(data));
            } catch (error) {
                console.error('Error loading config:', error);
                toast.error('Error al cargar la configuración de triggers');
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, []);

    const closeConfirmDialog = useCallback(() => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const performSave = useCallback(async () => {
        try {
            setIsSaving(true);
            const updated = await shopConfigService.updateConfig(formData);
            setConfig(updated);
            toast.success('Configuración de triggers actualizada y cupones sincronizados');
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar la configuración');
        } finally {
            setIsSaving(false);
            closeConfirmDialog();
        }
    }, [closeConfirmDialog, formData]);

    const openSaveConfirm = useCallback(() => {
        setConfirmDialog({
            isOpen: true,
            title: '¿Guardar configuración?',
            description: 'Se actualizarán los parámetros de los cupones automáticos de Bienvenida y VIP.',
            onConfirm: performSave,
        });
    }, [performSave]);

    const setField = useCallback(<K extends keyof TriggersConfigFormData>(field: K, value: TriggersConfigFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const setCouponType = useCallback((field: 'welcomeCouponType' | 'vipCouponType', value: string) => {
        setField(field, value as CouponType);
    }, [setField]);

    const setUpperTextField = useCallback((field: 'welcomeCouponCode' | 'vipCouponCode', value: string) => {
        setField(field, value.toUpperCase());
    }, [setField]);

    return {
        config,
        loading,
        isSaving,
        formData,
        setField,
        setCouponType,
        setUpperTextField,
        confirmDialog,
        openSaveConfirm,
        closeConfirmDialog,
    };
}
