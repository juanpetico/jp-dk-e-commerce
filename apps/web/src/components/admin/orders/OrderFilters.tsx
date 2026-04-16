'use client';

import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { OrderStatus } from '@/types';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/DateRangePicker';
import { format } from 'date-fns';

interface FilterValues {
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
    search?: string;
}

interface OrderFiltersProps {
    onFilterChange: (filters: FilterValues) => void;
    activeFiltersCount: number;
}

export default function OrderFilters({ onFilterChange, activeFiltersCount }: OrderFiltersProps) {
    const [status, setStatus] = useState<OrderStatus | ''>('');
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

    const handleStatusChange = (value: string) => {
        const newStatus = value === 'ALL' ? '' : (value as OrderStatus);
        setStatus(newStatus || '');
        applyFilters({ status: newStatus || undefined });
    };

    const handleDateRangeChange = (newRange: DateRange | undefined) => {
        setDateRange(newRange);
        applyFilters({
            startDate: newRange?.from ? format(newRange.from, 'yyyy-MM-dd') : undefined,
            endDate: newRange?.to ? format(newRange.to, 'yyyy-MM-dd') : undefined,
        });
    };

    const applyFilters = (partialFilters: Partial<FilterValues> = {}) => {
        // Combinar valores actuales con los cambios parciales
        const finalStatus = 'status' in partialFilters ? partialFilters.status : (status || undefined);
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
            status: finalStatus,
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
        setStatus('');
        setDateRange(undefined);
        setSearch('');
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        onFilterChange({});
    };

    return (
        <div className="flex flex-col gap-4 rounded border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between mb-6">
            <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-3 h-10 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
            </div>

            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <div className="relative">
                    <Select value={status === '' ? 'ALL' : status} onValueChange={handleStatusChange}>
                        <SelectTrigger className={`w-full h-10 bg-background border border-input rounded-md text-sm focus:ring-2 focus:ring-ring ${status === '' ? 'text-muted-foreground' : 'text-foreground'}`}>
                            <SelectValue placeholder="Estado del pedido" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los estados</SelectItem>
                            <SelectItem value="PENDING">Pendiente</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                            <SelectItem value="SHIPPED">Enviado</SelectItem>
                            <SelectItem value="DELIVERED">Entregado</SelectItem>
                            <SelectItem value="CANCELLED">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <DatePickerWithRange
                        date={dateRange}
                        setDate={handleDateRangeChange}
                        className="w-full md:w-auto"
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
