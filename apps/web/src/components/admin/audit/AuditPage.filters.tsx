import React from 'react';
import { DateRange } from 'react-day-picker';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DatePickerWithRange } from '@/components/ui/DateRangePicker';
import { Input } from '@/components/ui/input';
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
        <div className="flex flex-col gap-3 rounded border border-border bg-card p-4 shadow-sm md:flex-row md:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={actorQueryInput}
                    onChange={(e) => onActorQueryInputChange(e.target.value)}
                    placeholder="Buscar por nombre o correo..."
                    className="w-full pl-10 font-mono text-sm"
                />
            </div>

            <Select value={entityTypeFilter} onValueChange={onEntityTypeFilterChange}>
                <SelectTrigger className="w-full md:w-[200px]">
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
                <DatePickerWithRange date={selectedDateRange} setDate={onDateRangeChange} />
            </div>

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={onClearFilters} className="shrink-0 text-xs">
                    Limpiar filtros
                </Button>
            )}
        </div>
    );
}
