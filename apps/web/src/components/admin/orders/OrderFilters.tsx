'use client';

import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/Button';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import { DatePickerWithRange } from '@/components/ui/DateRangePicker';
import { format } from 'date-fns';

interface FilterValues {
    startDate?: string;
    endDate?: string;
    search?: string;
}

interface OrderFiltersProps {
    onFilterChange: (filters: FilterValues) => void;
    activeFiltersCount: number;
}

export default function OrderFilters({ onFilterChange, activeFiltersCount }: OrderFiltersProps) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [search, setSearch] = useState('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleSearchChange = (value: string) => {
        setSearch(value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            const trimmedValue = value.trim();
            applyFilters({ search: trimmedValue.length > 0 ? trimmedValue : undefined });
        }, 400);

        setSearchTimeout(timeout);
    };

    const handleDateRangeChange = (newRange: DateRange | undefined) => {
        setDateRange(newRange);
        applyFilters({
            startDate: newRange?.from ? format(newRange.from, 'yyyy-MM-dd') : undefined,
            endDate: newRange?.to ? format(newRange.to, 'yyyy-MM-dd') : undefined,
        });
    };

    const applyFilters = (partialFilters: Partial<FilterValues> = {}) => {
        const finalSearch = 'search' in partialFilters ? partialFilters.search : (search.trim() || undefined);

        // Handle dates - if passed in partial, use it, otherwise use date range state
        let finalStartDate = 'startDate' in partialFilters ? partialFilters.startDate : undefined;
        if (!('startDate' in partialFilters) && dateRange?.from) {
            finalStartDate = format(dateRange.from, 'yyyy-MM-dd');
        }

        let finalEndDate = 'endDate' in partialFilters ? partialFilters.endDate : undefined;
        if (!('endDate' in partialFilters) && dateRange?.to) {
            finalEndDate = format(dateRange.to, 'yyyy-MM-dd');
        }

        const filters: FilterValues = {
            startDate: finalStartDate,
            endDate: finalEndDate,
            search: finalSearch,
        };

        // Remover valores vacíos
        Object.keys(filters).forEach(key => {
            if (!filters[key as keyof FilterValues]) {
                delete filters[key as keyof FilterValues];
            }
        });

        onFilterChange(filters);
    };

    const clearFilters = () => {
        setDateRange(undefined);
        setSearch('');
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        onFilterChange({});
    };

    return (
        <div className="mb-6 flex flex-col gap-4 rounded border border-gray-300 dark:border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <AdminSearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre, correo o ID..."
                containerClassName="border-0"
                inputClassName="border-gray-300 dark:border-border"
            />

            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <div>
                    <DatePickerWithRange
                        date={dateRange}
                        setDate={handleDateRangeChange}
                        className="w-full md:w-auto"
                        triggerClassName="border-gray-300 dark:border-border"
                    />
                </div>

                {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                        Limpiar filtros
                    </Button>
                )}
            </div>
        </div>
    );
}
