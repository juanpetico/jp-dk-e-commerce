import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Category } from '@/types';

interface CategoriesBlockedDialogProps {
    basePath: string;
    blockedCategory: Category | null;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
}

export default function CategoriesBlockedDialog({
    basePath,
    blockedCategory,
    onOpenChange,
    onClose,
}: CategoriesBlockedDialogProps) {
    return (
        <Dialog open={!!blockedCategory} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm rounded-2xl border border-border bg-background shadow-2xl">
                <DialogHeader>
                    <div className="mb-2 flex justify-center">
                        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
                            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <DialogTitle className="text-center font-display text-lg font-bold uppercase tracking-wider">
                        No se puede eliminar
                    </DialogTitle>
                    <DialogDescription className="pt-2 text-center text-sm">
                        La categoría <span className="font-bold text-foreground">&quot;{blockedCategory?.name}&quot;</span> tiene{' '}
                        <span className="font-bold text-foreground">{blockedCategory?._count?.products}</span>{' '}
                        {(blockedCategory?._count?.products ?? 0) === 1
                            ? 'producto asignado'
                            : 'productos asignados'}.
                        Reasígnalos a otra categoría antes de eliminarla.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-2 gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                    <Link href={`${basePath}/products?category=${blockedCategory?.slug}`}>
                        <Button
                            className="flex w-full items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={onClose}
                        >
                            <ExternalLink className="h-4 w-4" />
                            Ver productos
                        </Button>
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
