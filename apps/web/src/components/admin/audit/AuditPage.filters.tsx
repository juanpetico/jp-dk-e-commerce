import React from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/Button';
import { DatePickerWithRange } from '@/components/ui/DateRangePicker';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ENTITY_TYPE_OPTIONS } from './AuditPage.constants';

interface AuditPageFiltersProps {
    actorQueryInput: string;
    entityTypeFilter: string;
    selectedDateRange: DateRange | undefined;
    hasFilters: boolean;
    onActorQueryInputChange: (value: string) => void;
    onEntityTypeFilterChange: (value: string) => void;
    onDateRangeChange: (range: DateRange | undefined) => void;
    onClearFilters: () => void;
}

export default function AuditPageFilters({
    actorQueryInput,
    entityTypeFilter,
    selectedDateRange,
    hasFilters,
    onActorQueryInputChange,
    onEntityTypeFilterChange,
    onDateRangeChange,
    onClearFilters,
}: AuditPageFiltersProps) {
    return (
        <div className="flex flex-col gap-3 rounded border border-gray-300 dark:border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <AdminSearchInput
                value={actorQueryInput}
                onChange={onActorQueryInputChange}
                placeholder="Buscar por nombre o correo..."
                containerClassName="border-0 md:w-[340px]"
                inputClassName="border-gray-300 font-mono text-sm dark:border-border"
            />

            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <Select value={entityTypeFilter} onValueChange={onEntityTypeFilterChange}>
                    <SelectTrigger
                        className={`w-full border-gray-300 dark:border-border md:w-auto ${
                            entityTypeFilter === 'ALL' ? 'text-muted-foreground' : ''
                        }`}
                    >
                        <SelectValue placeholder="Tipo de entidad" />
                    </SelectTrigger>
                    <SelectContent>
                        {ENTITY_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="w-full md:w-auto">
                    <DatePickerWithRange
                        date={selectedDateRange}
                        setDate={onDateRangeChange}
                        triggerClassName="border-gray-300 dark:border-border"
                    />
                </div>

                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={onClearFilters} className="shrink-0 text-xs">
                        Limpiar filtros
                    </Button>
                )}
            </div>
        </div>
    );
}
