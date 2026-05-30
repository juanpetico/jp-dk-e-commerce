import React from 'react';
import { Eye, Image, Menu, Star } from 'lucide-react';
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

interface CategoriesCreateDialogProps {
    open: boolean;
    createName: string;
    createImageUrl: string;
    createIsPublished: boolean;
    createShowInHero: boolean;
    createShowInMenu: boolean;
    createLoading: boolean;
    createError: string;
    onOpenChange: (open: boolean) => void;
    onCreateNameChange: (value: string) => void;
    onCreateImageUrlChange: (value: string) => void;
    onCreateIsPublishedChange: (value: boolean) => void;
    onCreateShowInHeroChange: (value: boolean) => void;
    onCreateShowInMenuChange: (value: boolean) => void;
    onSubmit: (event: React.FormEvent) => void;
}

export default function CategoriesCreateDialog({
    open,
    createName,
    createImageUrl,
    createIsPublished,
    createShowInHero,
    createShowInMenu,
    createLoading,
    createError,
    onOpenChange,
    onCreateNameChange,
    onCreateImageUrlChange,
    onCreateIsPublishedChange,
    onCreateShowInHeroChange,
    onCreateShowInMenuChange,
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

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Imagen de portada</Label>
                        <Input
                            placeholder="https://..."
                            value={createImageUrl}
                            onChange={(e) => onCreateImageUrlChange(e.target.value)}
                            className="h-11 bg-muted/50"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            URL de imagen que aparece en el banner de catálogo.
                        </p>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Visible en tienda</Label>
                                <p className="text-[10px] text-muted-foreground">
                                    La categoría aparece en la tienda pública.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={createIsPublished}
                            onCheckedChange={onCreateIsPublishedChange}
                            disabled={createLoading}
                            aria-label="Categoría visible en tienda"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Destacar en portada</Label>
                                <p className="text-[10px] text-muted-foreground">
                                    Aparece en el banner principal del catálogo (máx. 3).
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={createShowInHero}
                            onCheckedChange={onCreateShowInHeroChange}
                            disabled={createLoading}
                            aria-label="Destacar categoría en portada del catálogo"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <Menu className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Mostrar en Menú</Label>
                                <p className="text-[10px] text-muted-foreground">
                                    Aparece en el desplegable de categorías del menú.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={createShowInMenu}
                            onCheckedChange={onCreateShowInMenuChange}
                            disabled={createLoading}
                            aria-label="Mostrar categoría en menú de navegación"
                        />
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
