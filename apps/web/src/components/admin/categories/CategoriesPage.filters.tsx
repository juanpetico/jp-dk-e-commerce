import React from 'react';
import { Button } from '@/components/ui/Button';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    CategoryProductsFilter,
    CategorySortBy,
    CategoryStatusFilter,
} from './CategoriesPage.types';

interface CategoriesPageFiltersProps {
    searchInput: string;
    statusFilter: CategoryStatusFilter;
    productsFilter: CategoryProductsFilter;
    sortBy: CategorySortBy;
    hasFilters: boolean;
    onSearchInputChange: (value: string) => void;
    onStatusFilterChange: (value: CategoryStatusFilter) => void;
    onProductsFilterChange: (value: CategoryProductsFilter) => void;
    onSortByChange: (value: CategorySortBy) => void;
    onClearFilters: () => void;
}

export default function CategoriesPageFilters({
    searchInput,
    statusFilter,
    productsFilter,
    sortBy,
    hasFilters,
    onSearchInputChange,
    onStatusFilterChange,
    onProductsFilterChange,
    onSortByChange,
    onClearFilters,
}: CategoriesPageFiltersProps) {
    return (
        <div className="flex flex-col gap-3 rounded border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <AdminSearchInput
                value={searchInput}
                onChange={onSearchInputChange}
                placeholder="Buscar por nombre..."
                containerClassName="md:w-[340px]"
                inputClassName="font-mono text-sm"
            />

            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as CategoryStatusFilter)}>
                    <SelectTrigger className="w-full md:w-[160px]">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos los estados</SelectItem>
                        <SelectItem value="VISIBLE">Visible</SelectItem>
                        <SelectItem value="HIDDEN">Oculta</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={productsFilter} onValueChange={(value) => onProductsFilterChange(value as CategoryProductsFilter)}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Productos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos los productos</SelectItem>
                        <SelectItem value="WITH">Con productos</SelectItem>
                        <SelectItem value="WITHOUT">Sin productos</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => onSortByChange(value as CategorySortBy)}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="NAME_ASC">Nombre A→Z</SelectItem>
                        <SelectItem value="NAME_DESC">Nombre Z→A</SelectItem>
                        <SelectItem value="PRODUCTS_DESC">Más productos</SelectItem>
                        <SelectItem value="PRODUCTS_ASC">Menos productos</SelectItem>
                    </SelectContent>
                </Select>

                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={onClearFilters} className="shrink-0 text-xs">
                        Limpiar filtros
                    </Button>
                )}
            </div>
        </div>
    );
}
