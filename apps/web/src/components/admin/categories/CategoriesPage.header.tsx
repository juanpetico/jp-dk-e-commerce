import React from 'react';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CategoriesPageHeaderProps {
    loading: boolean;
    totalItems: number;
    onCreate: () => void;
}

export default function CategoriesPageHeader({
    loading,
    totalItems,
    onCreate,
}: CategoriesPageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-baseline gap-3">
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">
                        Categorías
                    </h1>
                    {!loading && (
                        <span className="text-sm font-bold text-muted-foreground">
                            {totalItems} {totalItems === 1 ? 'categoría' : 'categorías'}
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">Gestiona las categorías del catálogo</p>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2" disabled>
                    <Download className="h-4 w-4" />
                    Exportar
                </Button>

                <Button
                    onClick={onCreate}
                    className="flex items-center gap-2 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Categoría
                </Button>
            </div>
        </div>
    );
}
