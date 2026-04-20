import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ExportMenu from '@/components/admin/shared/ExportMenu';

interface MarketingPageHeaderProps {
    loading: boolean;
    visibleCouponsCount: number;
    currentExportCount: number;
    onCreateCoupon: () => void;
    onExportPdf: () => void;
    onExportExcel: () => void;
    onExportPdfAll?: () => void;
    onExportExcelAll?: () => void;
    showAllExportOptions?: boolean;
}

export default function MarketingPageHeader({
    loading,
    visibleCouponsCount,
    currentExportCount,
    onCreateCoupon,
    onExportPdf,
    onExportExcel,
    onExportPdfAll,
    onExportExcelAll,
    showAllExportOptions,
}: MarketingPageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h1 className="font-display text-3xl md:text-4xl font-black uppercase leading-none tracking-tight text-foreground">
                        Marketing
                    </h1>
                    {!loading && (
                        <span className="text-sm font-bold text-muted-foreground">
                            {visibleCouponsCount} {visibleCouponsCount === 1 ? 'cupón' : 'cupones'}
                        </span>
                    )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Cupones, campañas y drivers de fidelización</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <ExportMenu
                    disabled={loading || visibleCouponsCount === 0}
                    currentCount={currentExportCount}
                    totalCount={visibleCouponsCount}
                    onExportPdf={onExportPdf}
                    onExportExcel={onExportExcel}
                    onExportPdfAll={onExportPdfAll}
                    onExportExcelAll={onExportExcelAll}
                    showAllOptions={showAllExportOptions}
                />
                <Button
                    onClick={onCreateCoupon}
                    className="shrink-0 bg-primary text-xs font-bold uppercase tracking-widest text-primary-foreground"
                >
                    <PlusCircle className="h-4 w-4" />
                    Crear Cupón
                </Button>
            </div>
        </div>
    );
}
