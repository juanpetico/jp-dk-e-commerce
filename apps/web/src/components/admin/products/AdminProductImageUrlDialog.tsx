import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { ImageUrlModalState } from './AdminProductForm.types';

interface AdminProductImageUrlDialogProps {
    modal: ImageUrlModalState;
    onOpenChange: (open: boolean) => void;
    onUrlChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export function AdminProductImageUrlDialog({
    modal,
    onOpenChange,
    onUrlChange,
    onSave,
    onCancel,
}: AdminProductImageUrlDialogProps) {
    return (
        <Dialog open={modal.isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-background rounded-2xl shadow-2xl border border-border">
                <DialogHeader>
                    <DialogTitle className="text-center font-bold uppercase tracking-wider">
                        {modal.index !== null ? 'Editar Imagen' : 'Añadir Imagen'}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-6">
                    <Label htmlFor="imageUrl" className="text-xs font-bold uppercase text-muted-foreground flex items-center mb-2">
                        URL de la Imagen <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                        id="imageUrl"
                        autoFocus
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={modal.url}
                        onChange={(e) => onUrlChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onSave();
                            }
                        }}
                        className="bg-muted/50 border-zinc-300 dark:border-transparent focus:ring-primary h-12"
                    />
                    <p className="text-[10px] text-muted-foreground mt-2 italic">
                        Ingresa una URL directa a la imagen (Unsplash, Cloudinary, etc.)
                    </p>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button onClick={onSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        {modal.index !== null ? 'Guardar Cambios' : 'Añadir Imagen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
