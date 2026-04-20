import React from 'react';
import ExportMenu from '@/components/admin/shared/ExportMenu';

interface AuditPageHeaderProps {
    total: number;
    loading: boolean;
    currentExportCount: number;
    onExportPdf: () => void;
    onExportExcel: () => void;
    onExportPdfAll?: () => void;
    onExportExcelAll?: () => void;
    showAllExportOptions?: boolean;
}

export default function AuditPageHeader({
    total,
    loading,
    currentExportCount,
    onExportPdf,
    onExportExcel,
    onExportPdfAll,
    onExportExcelAll,
    showAllExportOptions,
}: AuditPageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground">
                        Auditoria
                    </h1>
                    {total > 0 && (
                        <span className="text-sm font-bold text-muted-foreground">
                            {total} {total === 1 ? 'registro' : 'registros'}
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Registro de todas las acciones de alto impacto en el sistema.
                </p>
            </div>

            <ExportMenu
                disabled={loading || total === 0}
                currentCount={currentExportCount}
                totalCount={total}
                onExportPdf={onExportPdf}
                onExportExcel={onExportExcel}
                onExportPdfAll={onExportPdfAll}
                onExportExcelAll={onExportExcelAll}
                showAllOptions={showAllExportOptions}
            />
        </div>
    );
}
