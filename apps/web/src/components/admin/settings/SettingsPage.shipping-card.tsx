import React from 'react';
import { Loader2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SettingsForm } from './SettingsPage.types';
import { formatThousandsCL } from './SettingsPage.utils';

interface SettingsShippingCardProps {
    form: SettingsForm;
    errors: Record<string, string>;
    isSaving: boolean;
    onChange: (partial: Partial<SettingsForm>) => void;
    onSave: () => void;
}

export default function SettingsShippingCard({
    form,
    errors,
    isSaving,
    onChange,
    onSave,
}: SettingsShippingCardProps) {
    return (
        <div className="rounded-lg border border-gray-300 bg-card p-6 shadow-sm dark:border-border">
            <h3 className="mb-6 border-b border-gray-300 pb-2 text-sm font-bold uppercase tracking-wide text-foreground dark:border-border">
                Envíos y Logística
            </h3>

            <div className="space-y-4">
                <div className="flex items-center gap-3 rounded border border-gray-300 bg-muted/20 p-4 dark:border-border">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-bold text-foreground">Envío estándar</p>
                        <p className="text-xs text-muted-foreground">
                            El costo se aplica al checkout salvo que el subtotal supere el umbral de envío gratis.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <Label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">
                            Costo de envío
                        </Label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                            </span>
                            <Input
                                type="text"
                                inputMode="numeric"
                                value={form.baseShippingCost}
                                onChange={(event) =>
                                    onChange({ baseShippingCost: formatThousandsCL(event.target.value) })
                                }
                                className="pl-7"
                            />
                        </div>
                        {errors.baseShippingCost && <p className="mt-1 text-xs text-red-500">{errors.baseShippingCost}</p>}
                    </div>

                    <div>
                        <Label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">
                            Monto para Envío Gratis
                        </Label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                            </span>
                            <Input
                                type="text"
                                inputMode="numeric"
                                value={form.freeShippingThreshold}
                                onChange={(event) =>
                                    onChange({ freeShippingThreshold: formatThousandsCL(event.target.value) })
                                }
                                className="pl-7"
                            />
                        </div>
                        {errors.freeShippingThreshold && (
                            <p className="mt-1 text-xs text-red-500">{errors.freeShippingThreshold}</p>
                        )}
                        <p className="mt-1 text-[11px] text-muted-foreground">Coloca 0 para desactivar el envío gratis.</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <Button onClick={onSave} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        'Guardar Cambios'
                    )}
                </Button>
            </div>
        </div>
    );
}
