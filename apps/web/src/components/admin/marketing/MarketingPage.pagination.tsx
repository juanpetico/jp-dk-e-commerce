import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MarketingPagePaginationProps {
    page: number;
    totalPages: number;
    onPrevious: () => void;
    onNext: () => void;
}

export default function MarketingPagePagination({
    page,
    totalPages,
    onPrevious,
    onNext,
}: MarketingPagePaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-8 flex items-center justify-center gap-4">
            <button
                onClick={onPrevious}
                disabled={page === 1}
                className="rounded-lg border border-border bg-card p-2 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-muted-foreground">
                Página {page} de {totalPages}
            </span>
            <button
                onClick={onNext}
                disabled={page === totalPages}
                className="rounded-lg border border-border bg-card p-2 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
