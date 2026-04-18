import React from 'react';
import ExportMenu from '@/components/admin/shared/ExportMenu';

interface CustomersPageHeaderProps {
    loading: boolean;
    visibleCount: number;
    currentExportCount: number;
    onExportPdf: () => void;
    onExportExcel: () => void;
    onExportPdfAll?: () => void;
    onExportExcelAll?: () => void;
    showAllExportOptions?: boolean;
}

export default function CustomersPageHeader({
    loading,
    visibleCount,
    currentExportCount,
    onExportPdf,
    onExportExcel,
    onExportPdfAll,
    onExportExcelAll,
    showAllExportOptions,
}: CustomersPageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-baseline gap-3">
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">
                        Clientes
                    </h1>
                    {!loading && (
                        <span className="text-sm font-bold text-muted-foreground">
                            {visibleCount} {visibleCount === 1 ? 'cliente' : 'clientes'}
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">Gestiona usuarios y roles</p>
            </div>

            <ExportMenu
                disabled={loading || visibleCount === 0}
                currentCount={currentExportCount}
                totalCount={visibleCount}
                onExportPdf={onExportPdf}
                onExportExcel={onExportExcel}
                onExportPdfAll={onExportPdfAll}
                onExportExcelAll={onExportExcelAll}
                showAllOptions={showAllExportOptions}
            />
        </div>
    );
}
