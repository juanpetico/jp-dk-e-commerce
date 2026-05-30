import React from 'react';
import { Eye, Menu, Star } from 'lucide-react';
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
    editImageUrl: string;
    editIsPublished: boolean;
    editShowInHero: boolean;
    editShowInMenu: boolean;
    editLoading: boolean;
    editError: string;
    onOpenChange: (open: boolean) => void;
    onEditNameChange: (value: string) => void;
    onEditImageUrlChange: (value: string) => void;
    onEditIsPublishedChange: (value: boolean) => void;
    onEditShowInHeroChange: (value: boolean) => void;
    onEditShowInMenuChange: (value: boolean) => void;
    onSubmit: (event: React.FormEvent) => void;
}

export default function CategoriesEditDialog({
    open,
    editName,
    editImageUrl,
    editIsPublished,
    editShowInHero,
    editShowInMenu,
    editLoading,
    editError,
    onOpenChange,
    onEditNameChange,
    onEditImageUrlChange,
    onEditIsPublishedChange,
    onEditShowInHeroChange,
    onEditShowInMenuChange,
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

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Imagen de portada</Label>
                        <Input
                            value={editImageUrl}
                            placeholder="https://..."
                            onChange={(e) => onEditImageUrlChange(e.target.value)}
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
                            checked={editIsPublished}
                            onCheckedChange={onEditIsPublishedChange}
                            disabled={editLoading}
                            aria-label="Cambiar visibilidad de la categoría"
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
                            checked={editShowInHero}
                            onCheckedChange={onEditShowInHeroChange}
                            disabled={editLoading}
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
                            checked={editShowInMenu}
                            onCheckedChange={onEditShowInMenuChange}
                            disabled={editLoading}
                            aria-label="Mostrar categoría en menú de navegación"
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
