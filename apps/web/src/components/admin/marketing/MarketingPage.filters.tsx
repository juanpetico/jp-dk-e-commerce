import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
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
        <div className="flex flex-col gap-4 rounded border border-gray-300 dark:border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <AdminSearchInput
                value={searchRaw}
                onChange={onSearchRawChange}
                placeholder="Buscar por código..."
                containerClassName="border-0"
                inputClassName="border-gray-300 dark:border-border"
            />

            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <select
                    value={filterStatus}
                    onChange={(event) => onFilterStatusChange(event.target.value as MarketingStatusFilter)}
                    className={`cursor-pointer rounded-lg border border-gray-300 dark:border-border bg-card px-3 py-2 text-sm focus:outline-none ${
                        filterStatus === 'ALL' ? 'text-muted-foreground' : 'text-foreground'
                    }`}
                >
                    <option value="ALL">Todos los estados</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="EXPIRADO">Expirado</option>
                </select>

                <select
                    value={filterType}
                    onChange={(event) => onFilterTypeChange(event.target.value as MarketingTypeFilter)}
                    className={`cursor-pointer rounded-lg border border-gray-300 dark:border-border bg-card px-3 py-2 text-sm focus:outline-none ${
                        filterType === 'ALL' ? 'text-muted-foreground' : 'text-foreground'
                    }`}
                >
                    <option value="ALL">Todos los tipos</option>
                    <option value="PERCENTAGE">Porcentaje</option>
                    <option value="FIXED_AMOUNT">Monto fijo</option>
                </select>

                <select
                    value={sortKey}
                    onChange={(event) => onSortKeyChange(event.target.value as MarketingSortKey)}
                    className="cursor-pointer rounded-lg border border-gray-300 dark:border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                    <option value="createdAt">Más reciente</option>
                    <option value="code">Código A→Z</option>
                    <option value="usedCount">Más usado</option>
                    <option value="roi">Mayor ROI</option>
                    <option value="revenue">Mayor ingreso</option>
                </select>

                <button
                    onClick={onToggleSortDir}
                    className="rounded-lg border border-gray-300 dark:border-border bg-card p-2 transition-colors hover:bg-muted"
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
