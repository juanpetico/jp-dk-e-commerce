import React from 'react';
import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CategoriesCreateDialogProps {
    open: boolean;
    createName: string;
    createLoading: boolean;
    createError: string;
    onOpenChange: (open: boolean) => void;
    onCreateNameChange: (value: string) => void;
    onSubmit: (event: React.FormEvent) => void;
}

export default function CategoriesCreateDialog({
    open,
    createName,
    createLoading,
    createError,
    onOpenChange,
    onCreateNameChange,
    onSubmit,
}: CategoriesCreateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                className="sm:max-w-sm rounded-2xl border border-border bg-background shadow-2xl"
            >
                <DialogHeader>
                    <DialogTitle className="text-center font-display text-lg font-bold uppercase tracking-wider">
                        Nueva Categoría
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Nombre</Label>
                        <Input
                            autoFocus
                            placeholder="Ej: Accesorios"
                            value={createName}
                            onChange={(e) => onCreateNameChange(e.target.value)}
                            className="h-11 bg-muted/50"
                        />
                        {createError && <p className="text-xs text-destructive">{createError}</p>}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={createLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {createLoading ? 'Creando...' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
