import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CategoriesPageEmptyProps {
    hasAnyCategories: boolean;
    onCreate: () => void;
    onClearFilters: () => void;
}

export default function CategoriesPageEmpty({
    hasAnyCategories,
    onCreate,
    onClearFilters,
}: CategoriesPageEmptyProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="rounded-full bg-muted p-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>

            {!hasAnyCategories ? (
                <>
                    <h3 className="text-lg font-bold text-foreground">No hay categorías</h3>
                    <p className="text-sm text-muted-foreground">
                        Crea la primera categoría para organizar el catálogo.
                    </p>
                    <Button onClick={onCreate} className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Categoría
                    </Button>
                </>
            ) : (
                <>
                    <h3 className="text-lg font-bold text-foreground">Sin resultados</h3>
                    <p className="text-sm text-muted-foreground">
                        Ninguna categoría coincide con los filtros aplicados.
                    </p>
                    <Button variant="outline" size="sm" onClick={onClearFilters}>
                        Limpiar filtros
                    </Button>
                </>
            )}
        </div>
    );
}
