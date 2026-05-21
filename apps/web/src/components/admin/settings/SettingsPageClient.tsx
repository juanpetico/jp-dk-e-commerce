'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AdminDataLoadErrorState from '@/components/admin/shared/AdminDataLoadErrorState';
import { shopConfigService } from '@/services/shopConfigService';
import SettingsPageGeneralCard from './SettingsPage.general-card';
import SettingsPageHeader from './SettingsPage.header';
import SettingsPageShippingCard from './SettingsPage.shipping-card';
import { SettingsForm } from './SettingsPage.types';
import { formatThousandsCL, parseThousandsCL, validateSettingsForm } from './SettingsPage.utils';

function SettingsFormSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            {[4, 2].map((fields, cardIdx) => (
                <div
                    key={cardIdx}
                    className="space-y-4 rounded border border-border bg-card p-6 shadow-sm dark:border-none"
                >
                    <div className="h-5 w-36 rounded-md bg-muted" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {Array.from({ length: fields }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 w-24 rounded bg-muted" />
                                <div className="h-9 w-full rounded-md bg-muted" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function SettingsPageClient() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<SettingsForm>({
        storeName: '',
        supportEmail: '',
        baseShippingCost: '',
        freeShippingThreshold: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const loadSettings = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            const config = await shopConfigService.getConfig();
            setForm({
                storeName: config.storeName || '',
                supportEmail: config.supportEmail || '',
                baseShippingCost: formatThousandsCL(config.baseShippingCost ?? 0),
                freeShippingThreshold: formatThousandsCL(config.freeShippingThreshold ?? 0),
            });
        } catch {
            setError('Error al cargar la configuración');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSettings();
    }, [loadSettings]);

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

    return (
        <div className="max-w-4xl animate-fade-in space-y-6 text-foreground">
            <SettingsPageHeader />

            {loading ? (
                <SettingsFormSkeleton />
            ) : error ? (
                <AdminDataLoadErrorState message={error} onRetry={loadSettings} />
            ) : (
                <>
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
                </>
            )}
        </div>
    );
}
