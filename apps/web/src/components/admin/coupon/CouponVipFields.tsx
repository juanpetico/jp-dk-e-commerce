'use client';

import React from 'react';
import { DollarSign, Trophy, Sparkles, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CouponVipFieldsProps {
    vipThreshold: number;
    vipRewardMessage: string;
    errors: Record<string, string>;
    formatNumber: (val: number | string | null | undefined) => string;
    parseNumber: (val: string) => number | null;
    onChange: (fields: { vipThreshold?: number; vipRewardMessage?: string }) => void;
}

export function CouponVipFields({ vipThreshold, vipRewardMessage, errors, formatNumber, parseNumber, onChange }: CouponVipFieldsProps) {
    return (
        <div className="space-y-4 pt-2 border-t border-border/50">
            <div className="space-y-2">
                <Label
                    htmlFor="vipThreshold"
                    className={cn('text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2', errors.vipThreshold && 'text-destructive')}
                >
                    <Trophy className="w-3 h-3 text-primary" /> Umbral para ser VIP ($)
                </Label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                        <DollarSign className="w-4 h-4" />
                    </div>
                    <Input
                        id="vipThreshold"
                        type="text"
                        value={formatNumber(vipThreshold)}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9,]/g, '');
                            onChange({ vipThreshold: parseNumber(val) ?? 0 });
                        }}
                        className={cn(
                            'pl-9 font-mono font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                            errors.vipThreshold && 'border-destructive focus-visible:ring-destructive'
                        )}
                    />
                </div>
                <p className="text-[10px] text-muted-foreground ml-1">Monto total gastado necesario para obtener este cupón.</p>
                {errors.vipThreshold && (
                    <p className="text-[10px] text-destructive font-black flex items-center gap-1 uppercase tracking-tighter ml-1">
                        <AlertCircle className="w-3 h-3" /> {errors.vipThreshold}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="vipRewardMessage" className="text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary" /> Mensaje de Recompensa
                </Label>
                <textarea
                    id="vipRewardMessage"
                    value={vipRewardMessage}
                    onChange={(e) => onChange({ vipRewardMessage: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder="¡Felicidades! Has ganado..."
                />
                <p className="text-[10px] text-muted-foreground ml-1">Este mensaje aparecerá en la alerta cuando el cliente alcance el nivel VIP.</p>
            </div>
        </div>
    );
}
