'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Settings, Save, Loader2, Sparkles, Trophy } from 'lucide-react';
import { shopConfigService, StoreConfig } from '../../services/shopConfigService';
import { toast } from 'sonner';

export function TriggersConfigCard() {
    const [config, setConfig] = useState<StoreConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        welcomeCouponCode: '',
        vipThreshold: 0,
        vipCouponCode: '',
        vipRewardMessage: ''
    });

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await shopConfigService.getConfig();
                setConfig(data);
                setFormData({
                    welcomeCouponCode: data.welcomeCouponCode,
                    vipThreshold: data.vipThreshold,
                    vipCouponCode: data.vipCouponCode,
                    vipRewardMessage: data.vipRewardMessage
                });
            } catch (error) {
                console.error('Error loading config:', error);
                toast.error('Error al cargar la configuración de triggers');
            } finally {
                setLoading(false);
            }
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const updated = await shopConfigService.updateConfig(formData);
            setConfig(updated);
            toast.success('Configuración de triggers actualizada correctamente');
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar la configuración');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cargando triggers...</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-gray-300 rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="p-6 border-b border-border bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-display font-black uppercase text-xl tracking-tight">Drivers de Fidelización</h2>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Configura la lógica de asignación automática</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Welcome Trigger */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Disparador: Bienvenida</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Código del Cupón</label>
                            <input
                                type="text"
                                value={formData.welcomeCouponCode}
                                onChange={(e) => setFormData({ ...formData, welcomeCouponCode: e.target.value.toUpperCase() })}
                                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                placeholder="BIENVENIDA"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">Este cupón se asignará automáticamente al registro.</p>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-border w-full" />

                {/* VIP Trigger */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Disparador: Cliente VIP</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Umbral de Compra (CLP)</label>
                            <input
                                type="number"
                                value={formData.vipThreshold}
                                onChange={(e) => setFormData({ ...formData, vipThreshold: parseInt(e.target.value) })}
                                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                placeholder="100000"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">Gasto mínimo en una compra para ganar el cupón.</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Código del Cupón</label>
                            <input
                                type="text"
                                value={formData.vipCouponCode}
                                onChange={(e) => setFormData({ ...formData, vipCouponCode: e.target.value.toUpperCase() })}
                                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                placeholder="VIP_GANG"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">El cupón privado que se otorgará.</p>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mensaje de Recompensa</label>
                        <textarea
                            value={formData.vipRewardMessage}
                            onChange={(e) => setFormData({ ...formData, vipRewardMessage: e.target.value })}
                            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium leading-relaxed"
                            placeholder="¡Felicidades! Has ganado un beneficio especial..."
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">Este mensaje se mostrará al usuario tras completar la compra.</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-muted/20 border-t border-border flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs h-10 px-6 gap-2"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
            </div>
        </div>
    );
}
