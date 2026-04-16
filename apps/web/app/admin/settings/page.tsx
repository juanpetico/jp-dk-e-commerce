'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../../src/components/ui/Button';
import { Truck, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { shopConfigService } from '@/services/shopConfigService';
import { toast } from 'sonner';

type ShippingForm = {
    storeName: string;
    supportEmail: string;
    baseShippingCost: string;
    freeShippingThreshold: string;
};

const formatThousandsCL = (value: number | string) => {
    const digits = String(value).replace(/\D/g, '');
    if (!digits) return '';
    return new Intl.NumberFormat('es-CL').format(Number(digits));
};

const parseThousandsCL = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits ? Number(digits) : 0;
};

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<ShippingForm>({
        storeName: '',
        supportEmail: '',
        baseShippingCost: '',
        freeShippingThreshold: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        (async () => {
            try {
                const cfg = await shopConfigService.getConfig();
                setForm({
                    storeName: cfg.storeName || '',
                    supportEmail: cfg.supportEmail || '',
                    baseShippingCost: formatThousandsCL(cfg.baseShippingCost ?? 0),
                    freeShippingThreshold: formatThousandsCL(cfg.freeShippingThreshold ?? 0),
                });
            } catch (e) {
                toast.error('Error al cargar la configuración');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const validate = (f: ShippingForm): Record<string, string> => {
        const errs: Record<string, string> = {};
        const baseShippingCost = parseThousandsCL(f.baseShippingCost);
        const freeShippingThreshold = parseThousandsCL(f.freeShippingThreshold);
        if (!f.storeName.trim()) errs.storeName = 'Requerido';
        if (!/^\S+@\S+\.\S+$/.test(f.supportEmail)) errs.supportEmail = 'Email inválido';
        if (!Number.isFinite(baseShippingCost) || baseShippingCost < 0) errs.baseShippingCost = 'Debe ser >= 0';
        if (!Number.isFinite(freeShippingThreshold) || freeShippingThreshold < 0) errs.freeShippingThreshold = 'Debe ser >= 0';
        return errs;
    };

    const handleSave = async () => {
        const errs = validate(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) {
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
        } catch (e: any) {
            toast.error(e?.message || 'Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando configuración...
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl text-foreground">
            <div className="mb-8">
                <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Configuración</h1>
                <p className="text-muted-foreground text-sm">Ajustes generales de la tienda</p>
            </div>

            {/* General Settings */}
            <div className="bg-card p-6 rounded-lg border border-gray-300 dark:border-border shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wide mb-6 border-b border-gray-300 dark:border-border pb-2 text-foreground">Información de la Tienda</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">Nombre de la tienda</Label>
                        <Input
                            type="text"
                            value={form.storeName}
                            onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
                        />
                        {errors.storeName && <p className="text-xs text-red-500 mt-1">{errors.storeName}</p>}
                    </div>
                    <div>
                        <Label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">Correo de soporte</Label>
                        <Input
                            type="email"
                            value={form.supportEmail}
                            onChange={e => setForm(f => ({ ...f, supportEmail: e.target.value }))}
                        />
                        {errors.supportEmail && <p className="text-xs text-red-500 mt-1">{errors.supportEmail}</p>}
                    </div>
                </div>
            </div>

            {/* Shipping Settings */}
            <div className="bg-card p-6 rounded-lg border border-gray-300 dark:border-border shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wide mb-6 border-b border-gray-300 dark:border-border pb-2 text-foreground">Envíos y Logística</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 border border-gray-300 dark:border-border rounded bg-muted/20">
                        <Truck className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="font-bold text-sm text-foreground">Envío estándar</p>
                            <p className="text-xs text-muted-foreground">El costo se aplica al checkout salvo que el subtotal supere el umbral de envío gratis.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">Costo de envío</Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={form.baseShippingCost}
                                    onChange={e => setForm(f => ({ ...f, baseShippingCost: formatThousandsCL(e.target.value) }))}
                                    className="pl-7"
                                />
                            </div>
                            {errors.baseShippingCost && <p className="text-xs text-red-500 mt-1">{errors.baseShippingCost}</p>}
                        </div>
                        <div>
                            <Label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">Monto para Envío Gratis</Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={form.freeShippingThreshold}
                                    onChange={e => setForm(f => ({ ...f, freeShippingThreshold: formatThousandsCL(e.target.value) }))}
                                    className="pl-7"
                                />
                            </div>
                            {errors.freeShippingThreshold && <p className="text-xs text-red-500 mt-1">{errors.freeShippingThreshold}</p>}
                            <p className="text-[11px] text-muted-foreground mt-1">Coloca 0 para desactivar el envío gratis.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />Guardando...</>) : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
