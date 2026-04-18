import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ExportMenuProps {
    disabled: boolean;
    currentCount: number;
    totalCount: number;
    onExportPdf: () => void;
    onExportExcel: () => void;
    onExportPdfAll?: () => void;
    onExportExcelAll?: () => void;
    showAllOptions?: boolean;
}

export default function ExportMenu({
    disabled,
    currentCount,
    totalCount,
    onExportPdf,
    onExportExcel,
    onExportPdfAll,
    onExportExcelAll,
    showAllOptions = false,
}: ExportMenuProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2" disabled={disabled}>
                    <Download className="h-4 w-4" />
                    Exportar
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-56 p-1">
                <button
                    className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    onClick={onExportPdf}
                >
                    Exportar PDF ({currentCount})
                </button>
                <button
                    className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    onClick={onExportExcel}
                >
                    Exportar Excel ({currentCount})
                </button>

                {showAllOptions && onExportPdfAll && onExportExcelAll && (
                    <>
                        <div className="my-1 border-t border-border" />
                        <button
                            className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                            onClick={onExportPdfAll}
                        >
                            PDF todos ({totalCount})
                        </button>
                        <button
                            className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                            onClick={onExportExcelAll}
                        >
                            Excel todos ({totalCount})
                        </button>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
}
