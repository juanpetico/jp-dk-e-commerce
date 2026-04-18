'use client';

import React from 'react';
import { Infinity, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/DatePicker';
import { cn } from '@/lib/utils';

interface CouponLimitsSectionProps {
    minAmount: number | null;
    maxUses: number | null;
    startDate: string;
    endDate: string;
    errors: Record<string, string>;
    formatNumber: (val: number | string | null | undefined) => string;
    parseNumber: (val: string) => number | null;
    onChange: (fields: Partial<{ minAmount: number | null; maxUses: number | null; startDate: string; endDate: string }>) => void;
}

export function CouponLimitsSection({ minAmount, maxUses, startDate, endDate, errors, formatNumber, parseNumber, onChange }: CouponLimitsSectionProps) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="minAmount" className="text-[11px] font-black uppercase tracking-widest ml-1">Venta Mínima ($)</Label>
                    <Input
                        id="minAmount"
                        type="text"
                        value={formatNumber(minAmount)}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9,]/g, '');
                            onChange({ minAmount: parseNumber(val) });
                        }}
                        className="font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="maxUses" className="text-[11px] font-black uppercase tracking-widest ml-1 flex justify-between items-center">
                        Usos Totales
                        <button
                            type="button"
                            onClick={() => onChange({ maxUses: maxUses === null ? 0 : null })}
                            className={cn(
                                'text-[9px] px-1.5 py-0.5 rounded border transition-colors flex items-center gap-1',
                                maxUses === null
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-muted text-muted-foreground border-border'
                            )}
                        >
                            <Infinity className="w-3 h-3" />
                            Ilimitado
                        </button>
                    </Label>
                    <Input
                        id="maxUses"
                        type="text"
                        placeholder={maxUses === null ? 'ILIMITADO' : 'Ej: 100'}
                        value={maxUses === null ? '' : formatNumber(maxUses)}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            onChange({ maxUses: val === '' ? null : parseInt(val) });
                        }}
                        className="font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:bg-muted/50 disabled:placeholder:text-foreground/50 disabled:placeholder:font-black"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-[11px] font-black uppercase tracking-widest ml-1">Fecha Inicio</Label>
                    <DatePicker
                        date={startDate ? new Date(startDate + 'T00:00:00') : undefined}
                        setDate={(date) => onChange({
                            startDate: date
                                ? (date.toISOString().split('T')[0] || '')
                                : (new Date().toISOString().split('T')[0] || '')
                        })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className={cn('text-[11px] font-black uppercase tracking-widest ml-1', errors.endDate && 'text-destructive')}>
                        Fecha Término
                    </Label>
                    <DatePicker
                        date={endDate ? new Date(endDate + 'T00:00:00') : undefined}
                        setDate={(date) => onChange({ endDate: date ? (date.toISOString().split('T')[0] || '') : '' })}
                        placeholder="Sin fin"
                    />
                    {errors.endDate && (
                        <p className="text-[10px] text-destructive font-black flex items-center gap-1 uppercase tracking-tighter ml-1">
                            <AlertCircle className="w-3 h-3" /> {errors.endDate}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
