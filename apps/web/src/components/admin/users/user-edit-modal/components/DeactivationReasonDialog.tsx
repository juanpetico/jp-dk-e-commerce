import React from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';

interface DeactivationReasonDialogProps {
    open: boolean;
    saving: boolean;
    value: string;
    onChange: (value: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export function DeactivationReasonDialog({
    open,
    saving,
    value,
    onChange,
    onClose,
    onConfirm,
}: DeactivationReasonDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div
                className="absolute inset-0 bg-black/50"
                onClick={(e) => {
                    e.stopPropagation();
                    if (!saving) onClose();
                }}
            />

            <div className="relative z-10 w-full max-w-lg rounded-xl border-2 bg-background p-5 shadow-2xl">
                <h3 className="text-lg font-bold text-destructive">Motivo de desactivacion</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Este texto se guardara y se mostrara al usuario cuando intente iniciar sesion.
                </p>

                <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Motivo</p>
                    <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Ej: Incumplimiento de terminos de uso"
                        rows={4}
                        disabled={saving}
                    />
                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        disabled={saving}
                    >
                        Cancelar
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm} disabled={saving}>
                        {saving ? 'Guardando...' : 'Desactivar cuenta'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
