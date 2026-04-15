'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../../src/components/ui/Button';
import { Truck, Loader2 } from 'lucide-react';
import { shopConfigService, StoreConfig } from '@/services/shopConfigService';
import { toast } from 'sonner';

type ShippingForm = {
    storeName: string;
    supportEmail: string;
    baseShippingCost: number;
    freeShippingThreshold: number;
};

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<ShippingForm>({
        storeName: '',
        supportEmail: '',
        baseShippingCost: 0,
        freeShippingThreshold: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        (async () => {
            try {
                const cfg = await shopConfigService.getConfig();
                setForm({
                    storeName: cfg.storeName || '',
                    supportEmail: cfg.supportEmail || '',
                    baseShippingCost: cfg.baseShippingCost ?? 0,
                    freeShippingThreshold: cfg.freeShippingThreshold ?? 0,
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
        if (!f.storeName.trim()) errs.storeName = 'Requerido';
        if (!/^\S+@\S+\.\S+$/.test(f.supportEmail)) errs.supportEmail = 'Email inválido';
        if (!Number.isFinite(f.baseShippingCost) || f.baseShippingCost < 0) errs.baseShippingCost = 'Debe ser ≥ 0';
        if (!Number.isFinite(f.freeShippingThreshold) || f.freeShippingThreshold < 0) errs.freeShippingThreshold = 'Debe ser ≥ 0';
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
                baseShippingCost: Math.round(form.baseShippingCost),
                freeShippingThreshold: Math.round(form.freeShippingThreshold),
            });
            toast.success('Configuración guardada');
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

    const inputCls = 'w-full bg-background border border-gray-300 dark:border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground text-foreground';

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
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Nombre de la tienda</label>
                        <input
                            type="text"
                            value={form.storeName}
                            onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
                            className={inputCls}
                        />
                        {errors.storeName && <p className="text-xs text-red-500 mt-1">{errors.storeName}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Correo de soporte</label>
                        <input
                            type="email"
                            value={form.supportEmail}
                            onChange={e => setForm(f => ({ ...f, supportEmail: e.target.value }))}
                            className={inputCls}
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
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Costo de envío</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.baseShippingCost}
                                    onChange={e => setForm(f => ({ ...f, baseShippingCost: Number(e.target.value) }))}
                                    className={`${inputCls} pl-6`}
                                />
                            </div>
                            {errors.baseShippingCost && <p className="text-xs text-red-500 mt-1">{errors.baseShippingCost}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Monto para Envío Gratis</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.freeShippingThreshold}
                                    onChange={e => setForm(f => ({ ...f, freeShippingThreshold: Number(e.target.value) }))}
                                    className={`${inputCls} pl-6`}
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
