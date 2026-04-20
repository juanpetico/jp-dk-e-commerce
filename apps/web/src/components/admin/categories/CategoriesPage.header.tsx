import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ExportMenu from '@/components/admin/shared/ExportMenu';

interface CategoriesPageHeaderProps {
    loading: boolean;
    totalItems: number;
    currentExportCount: number;
    onCreate: () => void;
    onExportPdf: () => void;
    onExportExcel: () => void;
    onExportPdfAll?: () => void;
    onExportExcelAll?: () => void;
    showAllExportOptions?: boolean;
}

export default function CategoriesPageHeader({
    loading,
    totalItems,
    currentExportCount,
    onCreate,
    onExportPdf,
    onExportExcel,
    onExportPdfAll,
    onExportExcelAll,
    showAllExportOptions,
}: CategoriesPageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground">
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

            <div className="flex flex-wrap items-center gap-2">
                <ExportMenu
                    disabled={loading || totalItems === 0}
                    currentCount={currentExportCount}
                    totalCount={totalItems}
                    onExportPdf={onExportPdf}
                    onExportExcel={onExportExcel}
                    onExportPdfAll={onExportPdfAll}
                    onExportExcelAll={onExportExcelAll}
                    showAllOptions={showAllExportOptions}
                />

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
