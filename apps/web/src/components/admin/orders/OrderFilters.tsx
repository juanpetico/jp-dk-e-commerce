'use client';

import React, { useState } from 'react';
import { OrderStatus } from '@/types';
import { Search, X, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/DatePicker';
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
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [search, setSearch] = useState('');

    // Debounce para búsqueda
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleSearchChange = (value: string) => {
        setSearch(value);

        // Limpiar timeout anterior
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Crear nuevo timeout
        const timeout = setTimeout(() => {
            applyFilters({ search: value });
        }, 500);

        setSearchTimeout(timeout);
    };

    const handleStatusChange = (value: string) => {
        const newStatus = value === 'ALL' ? '' : (value as OrderStatus);
        setStatus(newStatus || '');
        applyFilters({ status: newStatus || undefined });
    };

    const handleStartDateChange = (date?: Date) => {
        setStartDate(date);
        applyFilters({ startDate: date ? format(date, 'yyyy-MM-dd') : undefined });
    };

    const handleEndDateChange = (date?: Date) => {
        setEndDate(date);
        applyFilters({ endDate: date ? format(date, 'yyyy-MM-dd') : undefined });
    };

    const applyFilters = (partialFilters: Partial<FilterValues> = {}) => {
        // Combinar valores actuales con los cambios parciales
        const finalStatus = 'status' in partialFilters ? partialFilters.status : (status || undefined);

        // Handle search
        const finalSearch = 'search' in partialFilters ? partialFilters.search : (search || undefined);

        // Handle dates - if passed in partial, use it, otherwise use state formatted
        let finalStartDate = 'startDate' in partialFilters ? partialFilters.startDate : undefined;
        if (!('startDate' in partialFilters) && startDate) {
            finalStartDate = format(startDate, 'yyyy-MM-dd');
        }

        let finalEndDate = 'endDate' in partialFilters ? partialFilters.endDate : undefined;
        if (!('endDate' in partialFilters) && endDate) {
            finalEndDate = format(endDate, 'yyyy-MM-dd');
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
        setStartDate(undefined);
        setEndDate(undefined);
        setSearch('');
        onFilterChange({});
    };

    return (
        <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-bold text-sm uppercase text-foreground tracking-wide">Filtros</h3>
                </div>
                {activeFiltersCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:text-destructive/90 transition-colors bg-destructive/10 px-2 py-1 rounded-md"
                    >
                        <X className="w-3 h-3" />
                        Limpiar filtros ({activeFiltersCount})
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Búsqueda */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por ID o cliente..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-3 h-10 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                </div>

                {/* Estado */}
                <div>
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

                {/* Fecha Inicio */}
                <div>
                    <DatePicker
                        date={startDate}
                        setDate={handleStartDateChange}
                        placeholder="Desde"
                    />
                </div>

                {/* Fecha Fin */}
                <div>
                    <DatePicker
                        date={endDate}
                        setDate={handleEndDateChange}
                        placeholder="Hasta"
                    />
                </div>
            </div>
        </div>
    );
}
