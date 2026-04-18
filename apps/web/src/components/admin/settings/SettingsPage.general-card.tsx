import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SettingsForm } from './SettingsPage.types';

interface SettingsGeneralCardProps {
    form: SettingsForm;
    errors: Record<string, string>;
    onChange: (partial: Partial<SettingsForm>) => void;
}

export default function SettingsGeneralCard({ form, errors, onChange }: SettingsGeneralCardProps) {
    return (
        <div className="rounded-lg border border-gray-300 bg-card p-6 shadow-sm dark:border-border">
            <h3 className="mb-6 border-b border-gray-300 pb-2 text-sm font-bold uppercase tracking-wide text-foreground dark:border-border">
                Información de la Tienda
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <Label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">
                        Nombre de la tienda
                    </Label>
                    <Input
                        type="text"
                        value={form.storeName}
                        onChange={(event) => onChange({ storeName: event.target.value })}
                    />
                    {errors.storeName && <p className="mt-1 text-xs text-red-500">{errors.storeName}</p>}
                </div>

                <div>
                    <Label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">
                        Correo de soporte
                    </Label>
                    <Input
                        type="email"
                        value={form.supportEmail}
                        onChange={(event) => onChange({ supportEmail: event.target.value })}
                    />
                    {errors.supportEmail && <p className="mt-1 text-xs text-red-500">{errors.supportEmail}</p>}
                </div>
            </div>
        </div>
    );
}
