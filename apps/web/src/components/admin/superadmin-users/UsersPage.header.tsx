import React from 'react';
import ExportMenu from '@/components/admin/shared/ExportMenu';

interface UsersPageHeaderProps {
    loading: boolean;
    usersCount: number;
    currentExportCount: number;
    onExportPdf: () => void;
    onExportExcel: () => void;
    onExportPdfAll?: () => void;
    onExportExcelAll?: () => void;
    showAllExportOptions?: boolean;
}

export default function UsersPageHeader({
    loading,
    usersCount,
    currentExportCount,
    onExportPdf,
    onExportExcel,
    onExportPdfAll,
    onExportExcelAll,
    showAllExportOptions,
}: UsersPageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-baseline gap-3">
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">
                        Gestión de Usuarios
                    </h1>
                    {!loading && (
                        <span className="text-sm font-bold text-muted-foreground">
                            {usersCount} {usersCount === 1 ? 'usuario' : 'usuarios'}
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Administra roles, estados de cuenta y trazabilidad de cambios.
                </p>
            </div>

            <ExportMenu
                disabled={loading || usersCount === 0}
                currentCount={currentExportCount}
                totalCount={usersCount}
                onExportPdf={onExportPdf}
                onExportExcel={onExportExcel}
                onExportPdfAll={onExportPdfAll}
                onExportExcelAll={onExportExcelAll}
                showAllOptions={showAllExportOptions}
            />
        </div>
    );
}
