import React from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MarketingSortDir, MarketingSortKey, MarketingStatusFilter, MarketingTypeFilter } from './MarketingPage.types';

interface MarketingPageFiltersProps {
    couponsCount: number;
    searchRaw: string;
    filterStatus: MarketingStatusFilter;
    filterType: MarketingTypeFilter;
    sortKey: MarketingSortKey;
    sortDir: MarketingSortDir;
    hasActiveFilters: boolean;
    onSearchRawChange: (value: string) => void;
    onFilterStatusChange: (value: MarketingStatusFilter) => void;
    onFilterTypeChange: (value: MarketingTypeFilter) => void;
    onSortKeyChange: (value: MarketingSortKey) => void;
    onToggleSortDir: () => void;
    onClearFilters: () => void;
}

export default function MarketingPageFilters({
    couponsCount,
    searchRaw,
    filterStatus,
    filterType,
    sortKey,
    sortDir,
    hasActiveFilters,
    onSearchRawChange,
    onFilterStatusChange,
    onFilterTypeChange,
    onSortKeyChange,
    onToggleSortDir,
    onClearFilters,
}: MarketingPageFiltersProps) {
    if (couponsCount === 0) return null;

    return (
        <div className="flex flex-col gap-4 rounded border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar por código..."
                    value={searchRaw}
                    onChange={(event) => onSearchRawChange(event.target.value)}
                    className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
            </div>

            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <select
                    value={filterStatus}
                    onChange={(event) => onFilterStatusChange(event.target.value as MarketingStatusFilter)}
                    className="cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                    <option value="ALL">Todos los estados</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="EXPIRADO">Expirado</option>
                </select>

                <select
                    value={filterType}
                    onChange={(event) => onFilterTypeChange(event.target.value as MarketingTypeFilter)}
                    className="cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                    <option value="ALL">Todos los tipos</option>
                    <option value="PERCENTAGE">Porcentaje</option>
                    <option value="FIXED_AMOUNT">Monto fijo</option>
                </select>

                <select
                    value={sortKey}
                    onChange={(event) => onSortKeyChange(event.target.value as MarketingSortKey)}
                    className="min-w-[140px] cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                    <option value="createdAt">Más reciente</option>
                    <option value="code">Código A→Z</option>
                    <option value="usedCount">Más usado</option>
                    <option value="roi">Mayor ROI</option>
                    <option value="revenue">Mayor ingreso</option>
                </select>

                <button
                    onClick={onToggleSortDir}
                    className="rounded-lg border border-border bg-card p-2 transition-colors hover:bg-muted"
                    title={sortDir === 'asc' ? 'Ascendente' : 'Descendente'}
                >
                    {sortDir === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </button>

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs">
                        Limpiar filtros
                    </Button>
                )}
            </div>
        </div>
    );
}
