'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Percent, DollarSign, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Coupon, DiscountType } from '../../types';

import { toast } from 'sonner';

interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (coupon: Partial<Coupon>) => Promise<void>;
    initialData?: Coupon | null;
}

export default function CouponModal({ isOpen, onClose, onSave, initialData }: CouponModalProps) {
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: 'PERCENTAGE' as DiscountType,
        value: 0,
        minAmount: 0,
        maxUses: null as number | null,
        maxUsesPerUser: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '' as string,
        isActive: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

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
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    isActive: true,
                });
            }
            setErrors({});
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.code.trim()) newErrors.code = 'El código es requerido';
        else if (formData.code.length < 3) newErrors.code = 'Mínimo 3 caracteres';

        if (formData.value <= 0) newErrors.value = 'Debe ser mayor a 0';
        if (formData.type === 'PERCENTAGE' && formData.value > 100) newErrors.value = 'Máximo 100%';

        if (formData.minAmount < 0) newErrors.minAmount = 'No puede ser negativo';

        if (formData.maxUses !== null && formData.maxUses <= 0) newErrors.maxUses = 'Debe ser mayor a 0';
        if (formData.maxUsesPerUser <= 0) newErrors.maxUsesPerUser = 'Mínimo 1 uso';

        if (!formData.startDate) newErrors.startDate = 'Requerida';

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

        setIsSaving(true);
        try {
            await onSave({
                ...formData,
                code: formData.code.toUpperCase().trim(),
                maxUses: formData.maxUses === 0 ? null : formData.maxUses,
                endDate: formData.endDate || null,
            });
            onClose();
        } catch (error) {
            toast.error('Error al guardar el cupón');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative bg-card text-card-foreground rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-border animate-in zoom-in-95 duration-200">
                {/* Header Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

                <div className="p-6 overflow-y-auto max-h-[90vh]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black font-display uppercase tracking-tight text-foreground leading-none">
                                {initialData ? 'Editar Cupón' : 'Nuevo Cupón'}
                            </h2>
                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Configuración de campaña promocional</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Status Checkbox */}
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
                        </div>

                        {/* Type and Value */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest ml-1">Tipo de Descuento</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: DiscountType) => setFormData({ ...formData, type: value, value: 0 })}
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
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        {formData.type === 'PERCENTAGE' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                                    </div>
                                    <Input
                                        id="value"
                                        type="number"
                                        value={formData.value || ''}
                                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                                        className={cn("pl-9 font-mono font-bold", errors.value && "border-destructive focus-visible:ring-destructive")}
                                    />
                                </div>
                                {errors.value && <p className="text-[10px] text-destructive font-black flex items-center gap-1 uppercase tracking-tighter ml-1"><AlertCircle className="w-3 h-3" /> {errors.value}</p>}
                            </div>
                        </div>

                        {/* Limits */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minAmount" className="text-[11px] font-black uppercase tracking-widest ml-1">Venta Mínima ($)</Label>
                                <Input
                                    id="minAmount"
                                    type="number"
                                    value={formData.minAmount || ''}
                                    onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) || 0 })}
                                    className="font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxUses" className="text-[11px] font-black uppercase tracking-widest ml-1">Usos Totales</Label>
                                <Input
                                    id="maxUses"
                                    type="number"
                                    placeholder="Ilimitado"
                                    value={formData.maxUses === null ? '' : formData.maxUses}
                                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                                    className="font-mono"
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="text-[11px] font-black uppercase tracking-widest ml-1">Fecha Inicio</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="font-mono text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate" className={cn("text-[11px] font-black uppercase tracking-widest ml-1", errors.endDate && "text-destructive")}>Fecha Término</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className={cn("font-mono text-xs", errors.endDate && "border-destructive focus-visible:ring-destructive")}
                                    placeholder="Sin fin"
                                />
                                {errors.endDate && <p className="text-[10px] text-destructive font-black flex items-center gap-1 uppercase tracking-tighter ml-1"><AlertCircle className="w-3 h-3" /> {errors.endDate}</p>}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-6">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="flex-1 font-bold uppercase tracking-widest text-xs"
                                disabled={isSaving}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 font-black uppercase tracking-widest text-xs py-6"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Guardando...' : (initialData ? 'Actualizar Cupón' : 'Crear Cupón Premium')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
