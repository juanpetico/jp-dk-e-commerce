import React from 'react';
import { DollarSign, Sparkles, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TriggersConfigFormData } from './TriggersConfigCard.types';
import { formatTriggerNumber, parseTriggerNumber } from './TriggersConfigCard.utils';

interface TriggersConfigSectionsProps {
    formData: TriggersConfigFormData;
    setField: <K extends keyof TriggersConfigFormData>(field: K, value: TriggersConfigFormData[K]) => void;
    setCouponType: (field: 'welcomeCouponType' | 'vipCouponType', value: string) => void;
    setUpperTextField: (field: 'welcomeCouponCode' | 'vipCouponCode', value: string) => void;
}

export function TriggersConfigSections({
    formData,
    setField,
    setCouponType,
    setUpperTextField,
}: TriggersConfigSectionsProps) {
    return (
        <>
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
                            onChange={(e) => setUpperTextField('welcomeCouponCode', e.target.value)}
                            className="font-mono font-bold"
                            placeholder="BIENVENIDA"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo de Descuento</Label>
                        <Select value={formData.welcomeCouponType} onValueChange={(val) => setCouponType('welcomeCouponType', val)}>
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
                            value={formatTriggerNumber(formData.welcomeCouponValue)}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9,]/g, '');
                                setField('welcomeCouponValue', parseTriggerNumber(val));
                            }}
                            className="font-mono font-bold"
                            placeholder="10"
                        />
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground">Este cupón se creará/actualizará automáticamente y se asignará al registro.</p>
            </div>

            <div className="h-px bg-border w-full" />

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
                                value={formatTriggerNumber(formData.vipThreshold)}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9,]/g, '');
                                    setField('vipThreshold', parseTriggerNumber(val));
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
                            onChange={(e) => setUpperTextField('vipCouponCode', e.target.value)}
                            className="font-mono font-bold"
                            placeholder="VIP_GANG"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo</Label>
                        <Select value={formData.vipCouponType} onValueChange={(val) => setCouponType('vipCouponType', val)}>
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
                            value={formatTriggerNumber(formData.vipCouponValue)}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9,]/g, '');
                                setField('vipCouponValue', parseTriggerNumber(val));
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
                        onChange={(e) => setField('vipRewardMessage', e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium leading-relaxed resize-none"
                        placeholder="¡Felicidades! Has ganado un beneficio especial..."
                    />
                </div>
            </div>
        </>
    );
}
