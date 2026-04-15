'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Percent, DollarSign, Users, AlertCircle, Infinity, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/DatePicker';
import { Coupon, DiscountType } from '../../types';
import SonnerConfirm from '@/components/ui/SonnerConfirm'; // Import SonnerConfirm

import { toast } from 'sonner';

interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (coupon: Partial<Coupon> & { vipThreshold?: number; vipRewardMessage?: string }) => Promise<void>;
    initialData?: Coupon | null;
    automationType?: 'WELCOME' | 'VIP' | null;
    vipConfig?: {
        threshold: number;
        message: string;
    };
}

export default function CouponModal({ isOpen, onClose, onSave, initialData, automationType, vipConfig }: CouponModalProps) {
    const [formData, setFormData] = useState({
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

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => { }
    });

    // Helpers for formatting
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
            setConfirmDialog(prev => ({ ...prev, isOpen: false })); // Close dialog on unmount/close
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    code: initialData?.code || '',
                    description: initialData?.description || '',
                    type: initialData?.type || 'PERCENTAGE',
                    value: initialData?.value || 0,
                    minAmount: initialData?.minAmount || 0,
                    maxUses: initialData?.maxUses ?? null,
                    maxUsesPerUser: initialData?.maxUsesPerUser || 1,
                    startDate: initialData?.startDate ? (new Date(initialData.startDate).toISOString().split('T')[0] || '') : (new Date().toISOString().split('T')[0] || ''),
                    endDate: initialData?.endDate ? (new Date(initialData.endDate).toISOString().split('T')[0] || '') : '',
                    isActive: initialData?.isActive ?? true,
                    vipThreshold: vipConfig?.threshold || 0,
                    vipRewardMessage: vipConfig?.message || ''
                });
            } else {
                setFormData({
                    code: '',
                    description: '',
                    type: 'PERCENTAGE',
                    value: 0,
                    minAmount: 0,
                    maxUses: null,
                    maxUsesPerUser: 1,
                    startDate: new Date().toISOString().split('T')[0] || '',
                    endDate: '',
                    isActive: true,
                    vipThreshold: 0,
                    vipRewardMessage: ''
                });
            }
            setErrors({});
        }
    }, [initialData, isOpen, vipConfig]);

    // Automatic Message Update Logic
    useEffect(() => {
        if (automationType === 'VIP' && formData.value) {
            const discountText = formData.type === 'PERCENTAGE'
                ? `${formData.value}%`
                : `$${formatNumber(formData.value)}`;

            let newMessage = formData.vipRewardMessage;

            // Defines the pattern to look for (matches both % and $)
            const pattern = /(\d+(?:[.,]\d+)?\s*%|\$\s?[\d.,]+)/;

            if (!newMessage || !newMessage.trim()) {
                newMessage = `¡Felicidades! Has desbloqueado un cupón de ${discountText} de descuento por tus compras.`;
            } else if (newMessage.match(pattern)) {
                // Replace existing discount value in the message
                newMessage = newMessage.replace(pattern, discountText);
            }

            // Only update if it actually changed to avoid infinite loops or cursor jumps if we were editing
            if (newMessage !== formData.vipRewardMessage) {
                setFormData(prev => ({ ...prev, vipRewardMessage: newMessage }));
            }
        }
    }, [formData.value, formData.type, automationType]);


    if (!isOpen) return null;

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

        if (automationType === 'VIP' && (formData.vipThreshold <= 0)) {
            newErrors.vipThreshold = 'Debe ser mayor a 0';
        }

        if (formData.endDate && formData.startDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end < start) {
                newErrors.endDate = 'Debe ser posterior al inicio';
            }
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
        } catch (error) {
            toast.error('Error al guardar el cupón');
        } finally {
            setIsSaving(false);
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-border animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center bg-muted/30 relative">
                    <button onClick={onClose} aria-label="Cerrar modal" className="absolute left-6 text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold font-display uppercase tracking-wider text-foreground w-full text-center leading-none">
                        {automationType === 'WELCOME' ? 'Editar Cupón de Bienvenida' :
                            automationType === 'VIP' ? 'Editar Cupón de Cliente VIP' :
                                initialData ? 'Editar Cupón' : 'Nuevo Cupón'}
                    </h2>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 text-card-foreground">
                    <form id="coupon-form" onSubmit={handleSubmit} className="space-y-6">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">
                            {automationType ? 'Configuración de Driver de Fidelización' : 'Configuración de campaña promocional'}
                        </p>

                        {automationType && (
                            <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
                                <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle className="w-3 h-3" /> Aviso de sincronización
                                </p>
                                <p className="text-[10px] text-primary/80 font-medium leading-tight mt-1">
                                    Los cambios realizados aquí se sincronizarán automáticamente con la configuración de Drivers de Fidelización.
                                </p>
                            </div>
                        )}

                        {/* Status Checkbox */}
                        {(
                            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
                                <div className="space-y-0.5">
                                    <Label htmlFor="isActive" className="text-sm font-bold uppercase tracking-tight cursor-pointer">Estado del Cupón</Label>
                                    <p className="text-[10px] text-muted-foreground">Determina si el cupón puede ser usado comercialmente.</p>
                                </div>
                                <Checkbox
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                                    className="w-5 h-5"
                                />
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code" className={cn("text-[11px] font-black uppercase tracking-widest ml-1", errors.code && "text-destructive")}>Código de Cupón</Label>
                                <Input
                                    id="code"
                                    placeholder="EJ: BLACKFRIDAY20"
                                    value={formData.code.toUpperCase()}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                                    className={cn("font-mono font-bold tracking-widest uppercase", errors.code && "border-destructive focus-visible:ring-destructive")}
                                />
                                {errors.code && <p className="text-[10px] text-destructive font-black flex items-center gap-1 uppercase tracking-tighter ml-1"><AlertCircle className="w-3 h-3" /> {errors.code}</p>}
                            </div>

                            {!automationType && (
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-[11px] font-black uppercase tracking-widest ml-1">Descripción (Interno)</Label>
                                    <Input
                                        id="description"
                                        placeholder="Ej: Descuento para lanzamiento de nueva colección"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Type and Value */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest ml-1">Tipo de Descuento</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: DiscountType) => setFormData({ ...formData, type: value, value: null })}
                                >
                                    <SelectTrigger className="font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE" className="font-medium">Porcentaje (%)</SelectItem>
                                        <SelectItem value="FIXED_AMOUNT" className="font-medium">Monto Fijo ($)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value" className={cn("text-[11px] font-black uppercase tracking-widest ml-1", errors.value && "text-destructive")}>Valor Descuento</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                                        {formData.type === 'PERCENTAGE' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                                    </div>
                                    <Input
                                        id="value"
                                        type="text"
                                        value={formatNumber(formData.value)}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9,]/g, '');
                                            setFormData({ ...formData, value: parseNumber(val) });
                                        }}
                                        className={cn("pl-9 font-mono font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none", errors.value && "border-destructive focus-visible:ring-destructive")}
                                    />
                                </div>
                                {errors.value && <p className="text-[10px] text-destructive font-black flex items-center gap-1 uppercase tracking-tighter ml-1"><AlertCircle className="w-3 h-3" /> {errors.value}</p>}
                            </div>
                        </div>

                        {/* VIP Specific Fields */}
                        {automationType === 'VIP' && (
                            <div className="space-y-4 pt-2 border-t border-border/50">
                                <div className="space-y-2">
                                    <Label htmlFor="vipThreshold" className={cn("text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2", errors.vipThreshold && "text-destructive")}>
                                        <Trophy className="w-3 h-3 text-primary" /> Umbral para ser VIP ($)
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <Input
                                            id="vipThreshold"
                                            type="text"
                                            value={formatNumber(formData.vipThreshold)}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9,]/g, '');
                                                setFormData({ ...formData, vipThreshold: parseNumber(val) ?? 0 });
                                            }}
                                            className={cn("pl-9 font-mono font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none", errors.vipThreshold && "border-destructive focus-visible:ring-destructive")}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground ml-1">Monto total gastado necesario para obtener este cupón.</p>
                                    {errors.vipThreshold && <p className="text-[10px] text-destructive font-black flex items-center gap-1 uppercase tracking-tighter ml-1"><AlertCircle className="w-3 h-3" /> {errors.vipThreshold}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vipRewardMessage" className="text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-primary" /> Mensaje de Recompensa
                                    </Label>
                                    <textarea
                                        id="vipRewardMessage"
                                        value={formData.vipRewardMessage}
                                        onChange={(e) => setFormData({ ...formData, vipRewardMessage: e.target.value })}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                        placeholder="¡Felicidades! Has ganado..."
                                    />
                                    <p className="text-[10px] text-muted-foreground ml-1">Este mensaje aparecerá en la alerta cuando el cliente alcance el nivel VIP.</p>
                                </div>
                            </div>
                        )}

                        {!automationType && (
                            <>
                                {/* Limits */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="minAmount" className="text-[11px] font-black uppercase tracking-widest ml-1">Venta Mínima ($)</Label>
                                        <Input
                                            id="minAmount"
                                            type="text"
                                            value={formatNumber(formData.minAmount)}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9,]/g, '');
                                                setFormData({ ...formData, minAmount: parseNumber(val) });
                                            }}
                                            className="font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxUses" className="text-[11px] font-black uppercase tracking-widest ml-1 flex justify-between items-center">
                                            Usos Totales
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, maxUses: formData.maxUses === null ? 0 : null })}
                                                className={cn(
                                                    "text-[9px] px-1.5 py-0.5 rounded border transition-colors flex items-center gap-1",
                                                    formData.maxUses === null ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
                                                )}
                                            >
                                                <Infinity className="w-3 h-3" />
                                                Ilimitado
                                            </button>
                                        </Label>
                                        <Input
                                            id="maxUses"
                                            type="text"
                                            placeholder={formData.maxUses === null ? "ILIMITADO" : "Ej: 100"}
                                            value={formData.maxUses === null ? '' : formatNumber(formData.maxUses)}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                setFormData({ ...formData, maxUses: val === '' ? null : parseInt(val) });
                                            }}
                                            className="font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:bg-muted/50 disabled:placeholder:text-foreground/50 disabled:placeholder:font-black"
                                        />
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest ml-1">Fecha Inicio</Label>
                                        <DatePicker
                                            date={formData.startDate ? new Date(formData.startDate + 'T00:00:00') : undefined}
                                            setDate={(date) => setFormData({ ...formData, startDate: date ? (date.toISOString().split('T')[0] || '') : (new Date().toISOString().split('T')[0] || '') })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={cn("text-[11px] font-black uppercase tracking-widest ml-1", errors.endDate && "text-destructive")}>Fecha Término</Label>
                                        <DatePicker
                                            date={formData.endDate ? new Date(formData.endDate + 'T00:00:00') : undefined}
                                            setDate={(date) => setFormData({ ...formData, endDate: date ? (date.toISOString().split('T')[0] || '') : '' })}
                                            placeholder="Sin fin"
                                        />
                                        {errors.endDate && <p className="text-[10px] text-destructive font-black flex items-center gap-1 uppercase tracking-tighter ml-1"><AlertCircle className="w-3 h-3" /> {errors.endDate}</p>}
                                    </div>
                                </div>
                            </>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
                    <Button form="coupon-form" type="submit" disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        {isSaving ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Crear Cupón')}
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
        </div>
    );
}
