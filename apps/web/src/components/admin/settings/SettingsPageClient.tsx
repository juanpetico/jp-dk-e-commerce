'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { shopConfigService } from '@/services/shopConfigService';
import SettingsPageGeneralCard from './SettingsPage.general-card';
import SettingsPageHeader from './SettingsPage.header';
import SettingsPageShippingCard from './SettingsPage.shipping-card';
import { SettingsForm } from './SettingsPage.types';
import { formatThousandsCL, parseThousandsCL, validateSettingsForm } from './SettingsPage.utils';

export default function SettingsPageClient() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<SettingsForm>({
        storeName: '',
        supportEmail: '',
        baseShippingCost: '',
        freeShippingThreshold: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const config = await shopConfigService.getConfig();
                setForm({
                    storeName: config.storeName || '',
                    supportEmail: config.supportEmail || '',
                    baseShippingCost: formatThousandsCL(config.baseShippingCost ?? 0),
                    freeShippingThreshold: formatThousandsCL(config.freeShippingThreshold ?? 0),
                });
            } catch {
                toast.error('Error al cargar la configuración');
            } finally {
                setLoading(false);
            }
        };

        void loadSettings();
    }, []);

    const handleSave = async () => {
        const validationErrors = validateSettingsForm(form);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            toast.error('Revisa los campos marcados');
            return;
        }

        setIsSaving(true);
        try {
            await shopConfigService.updateConfig({
                storeName: form.storeName.trim(),
                supportEmail: form.supportEmail.trim(),
                baseShippingCost: Math.round(parseThousandsCL(form.baseShippingCost)),
                freeShippingThreshold: Math.round(parseThousandsCL(form.freeShippingThreshold)),
            });
            toast.success('Configuración guardada correctamente');
        } catch (requestError: unknown) {
            const message =
                requestError instanceof Error ? requestError.message : 'Error al guardar';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Cargando configuración...
            </div>
        );
    }

    return (
        <div className="max-w-4xl animate-fade-in space-y-6 text-foreground">
            <SettingsPageHeader />

            <SettingsPageGeneralCard
                form={form}
                errors={errors}
                onChange={(partial) => setForm((current) => ({ ...current, ...partial }))}
            />

            <SettingsPageShippingCard
                form={form}
                errors={errors}
                isSaving={isSaving}
                onChange={(partial) => setForm((current) => ({ ...current, ...partial }))}
                onSave={handleSave}
            />
        </div>
    );
}
