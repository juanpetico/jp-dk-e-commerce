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
import { Switch } from '@/components/ui/switch';

interface CategoriesEditDialogProps {
    open: boolean;
    editName: string;
    editIsPublished: boolean;
    editLoading: boolean;
    editError: string;
    onOpenChange: (open: boolean) => void;
    onEditNameChange: (value: string) => void;
    onEditIsPublishedChange: (value: boolean) => void;
    onSubmit: (event: React.FormEvent) => void;
}

export default function CategoriesEditDialog({
    open,
    editName,
    editIsPublished,
    editLoading,
    editError,
    onOpenChange,
    onEditNameChange,
    onEditIsPublishedChange,
    onSubmit,
}: CategoriesEditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                className="sm:max-w-sm rounded-2xl border border-border bg-background shadow-2xl"
            >
                <DialogHeader>
                    <DialogTitle className="text-center font-display text-lg font-bold uppercase tracking-wider">
                        Editar Categoría
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Nombre</Label>
                        <Input
                            autoFocus
                            value={editName}
                            onChange={(e) => onEditNameChange(e.target.value)}
                            className="h-11 bg-muted/50"
                        />
                        {editError && <p className="text-xs text-destructive">{editError}</p>}
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                        <div>
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Visible en tienda</Label>
                            <p className="text-[10px] text-muted-foreground">
                                Este cambio se guarda al confirmar la edición.
                            </p>
                        </div>
                        <Switch
                            checked={editIsPublished}
                            onCheckedChange={onEditIsPublishedChange}
                            disabled={editLoading}
                            aria-label="Cambiar visibilidad de la categoría"
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={editLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {editLoading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
