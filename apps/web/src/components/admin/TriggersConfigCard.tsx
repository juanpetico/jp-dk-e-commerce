'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Settings, Save, Loader2, Sparkles, Trophy, DollarSign } from 'lucide-react';
import { shopConfigService, StoreConfig } from '@/services/shopConfigService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SonnerConfirm from '@/components/ui/SonnerConfirm'; // Import SonnerConfirm

export default function TriggersConfigCard() {
    const [config, setConfig] = useState<StoreConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        welcomeCouponCode: '',
        welcomeCouponType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
        welcomeCouponValue: 0,
        vipThreshold: 0,
        vipCouponCode: '',
        vipCouponType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
        vipCouponValue: 0,
        vipRewardMessage: ''
    });

    // Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => { }
    });

    // Validar form
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await shopConfigService.getConfig();
                setConfig(data);
                setFormData({
                    welcomeCouponCode: data.welcomeCouponCode,
                    welcomeCouponType: data.welcomeCouponType || 'PERCENTAGE',
                    welcomeCouponValue: data.welcomeCouponValue || 0,
                    vipThreshold: data.vipThreshold,
                    vipCouponCode: data.vipCouponCode,
                    vipCouponType: data.vipCouponType || 'PERCENTAGE',
                    vipCouponValue: data.vipCouponValue || 0,
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

    const formatNumber = (val: number | string | null | undefined) => {
        if (val === undefined || val === null || val === '') return '';
        const parts = val.toString().split('.');
        if (parts[0]) {
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
        return parts.join(',');
    };

    const parseNumber = (val: string) => {
        const clean = val.replace(/\./g, '').replace(',', '.');
        if (clean === '') return 0;
        return parseFloat(clean) || 0;
    };

    const handleSaveClick = () => {
        setConfirmDialog({
            isOpen: true,
            title: '¿Guardar configuración?',
            description: 'Se actualizarán los parámetros de los cupones automáticos de Bienvenida y VIP.',
            onConfirm: performSave
        });
    };

    const performSave = async () => {
        try {
            setIsSaving(true);
            const updated = await shopConfigService.updateConfig(formData);
            setConfig(updated);
            toast.success('Configuración de triggers actualizada y cupones sincronizados');
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar la configuración');
        } finally {
            setIsSaving(false);
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
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
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-500">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Código</Label>
                            <Input
                                value={formData.welcomeCouponCode}
                                onChange={(e) => setFormData({ ...formData, welcomeCouponCode: e.target.value.toUpperCase() })}
                                className="font-mono font-bold"
                                placeholder="BIENVENIDA"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo de Descuento</Label>
                            <Select
                                value={formData.welcomeCouponType}
                                onValueChange={(val: any) => setFormData({ ...formData, welcomeCouponType: val })}
                            >
                                <SelectTrigger className="font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">Porcentaje (%)</SelectItem>
                                    <SelectItem value="FIXED_AMOUNT">Monto Fijo ($)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Valor</Label>
                            <Input
                                value={formatNumber(formData.welcomeCouponValue)}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9,]/g, '');
                                    setFormData({ ...formData, welcomeCouponValue: parseNumber(val) });
                                }}
                                className="font-mono font-bold"
                                placeholder="10"
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Este cupón se creará/actualizará automáticamente y se asignará al registro.</p>
                </div>

                <div className="h-px bg-border w-full" />

                {/* VIP Trigger */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Disparador: Cliente VIP</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Umbral (CLP)</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                                    <DollarSign className="w-3.5 h-3.5" />
                                </div>
                                <Input
                                    value={formatNumber(formData.vipThreshold)}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9,]/g, '');
                                        setFormData({ ...formData, vipThreshold: parseNumber(val) });
                                    }}
                                    className="pl-8 font-mono font-bold"
                                    placeholder="100.000"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Código</Label>
                            <Input
                                value={formData.vipCouponCode}
                                onChange={(e) => setFormData({ ...formData, vipCouponCode: e.target.value.toUpperCase() })}
                                className="font-mono font-bold"
                                placeholder="VIP_GANG"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo</Label>
                            <Select
                                value={formData.vipCouponType}
                                onValueChange={(val: any) => setFormData({ ...formData, vipCouponType: val })}
                            >
                                <SelectTrigger className="font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">Porcentaje (%)</SelectItem>
                                    <SelectItem value="FIXED_AMOUNT">Monto Fijo ($)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Valor</Label>
                            <Input
                                value={formatNumber(formData.vipCouponValue)}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9,]/g, '');
                                    setFormData({ ...formData, vipCouponValue: parseNumber(val) });
                                }}
                                className="font-mono font-bold"
                                placeholder="15"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mensaje de Recompensa (Pop-up)</Label>
                        <textarea
                            value={formData.vipRewardMessage}
                            onChange={(e) => setFormData({ ...formData, vipRewardMessage: e.target.value })}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium leading-relaxed resize-none"
                            placeholder="¡Felicidades! Has ganado un beneficio especial..."
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 bg-muted/20 border-t border-border flex justify-end">
                <Button
                    onClick={handleSaveClick}
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

            <SonnerConfirm
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                description={confirmDialog.description}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
