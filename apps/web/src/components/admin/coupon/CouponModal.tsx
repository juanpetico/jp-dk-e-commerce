'use client';

import React from 'react';
import { Percent, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import SonnerConfirm from '@/components/ui/SonnerConfirm';
import { Coupon, DiscountType } from '../../../types';
import { CouponModalHeader } from './CouponModalHeader';
import { CouponVipFields } from './CouponVipFields';
import { CouponLimitsSection } from './CouponLimitsSection';
import { useCouponForm } from './useCouponForm';

interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (coupon: Partial<Coupon> & { vipThreshold?: number; vipRewardMessage?: string }) => Promise<void>;
    initialData?: Coupon | null;
    automationType?: 'WELCOME' | 'VIP' | null;
    vipConfig?: { threshold: number; message: string };
}

export default function CouponModal({ isOpen, onClose, onSave, initialData, automationType, vipConfig }: CouponModalProps) {
    const { formData, setFormData, errors, isSaving, confirmDialog, setConfirmDialog, handleSubmit, formatNumber, parseNumber } =
        useCouponForm({ isOpen, initialData, automationType, vipConfig, onSave, onClose });

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-border animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <CouponModalHeader onClose={onClose} hasInitialData={!!initialData} automationType={automationType} />

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

                        {/* Estado */}
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

                        {/* Código + Descripción */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="code"
                                    className={cn('text-[11px] font-black uppercase tracking-widest ml-1', errors.code && 'text-destructive')}
                                >
                                    Código de Cupón
                                </Label>
                                <Input
                                    id="code"
                                    placeholder="EJ: BLACKFRIDAY20"
                                    value={formData.code.toUpperCase()}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                                    className={cn('font-mono font-bold tracking-widest uppercase', errors.code && 'border-destructive focus-visible:ring-destructive')}
                                />
                                {errors.code && (
                                    <p className="text-[10px] text-destructive font-black flex items-center gap-1 uppercase tracking-tighter ml-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.code}
                                    </p>
                                )}
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

                        {/* Tipo + Valor */}
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
                                <Label
                                    htmlFor="value"
                                    className={cn('text-[11px] font-black uppercase tracking-widest ml-1', errors.value && 'text-destructive')}
                                >
                                    Valor Descuento
                                </Label>
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
                                        className={cn(
                                            'pl-9 font-mono font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                                            errors.value && 'border-destructive focus-visible:ring-destructive'
                                        )}
                                    />
                                </div>
                                {errors.value && (
                                    <p className="text-[10px] text-destructive font-black flex items-center gap-1 uppercase tracking-tighter ml-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.value}
                                    </p>
                                )}
                            </div>
                        </div>

                        {automationType === 'VIP' && (
                            <CouponVipFields
                                vipThreshold={formData.vipThreshold}
                                vipRewardMessage={formData.vipRewardMessage}
                                errors={errors}
                                formatNumber={formatNumber}
                                parseNumber={parseNumber}
                                onChange={(fields) => setFormData(prev => ({ ...prev, ...fields }))}
                            />
                        )}

                        {!automationType && (
                            <CouponLimitsSection
                                minAmount={formData.minAmount}
                                maxUses={formData.maxUses}
                                startDate={formData.startDate}
                                endDate={formData.endDate}
                                errors={errors}
                                formatNumber={formatNumber}
                                parseNumber={parseNumber}
                                onChange={(fields) => setFormData(prev => ({ ...prev, ...fields }))}
                            />
                        )}
                    </form>
                </div>

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
