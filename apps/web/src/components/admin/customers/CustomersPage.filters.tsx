import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CustomerRoleFilter } from './CustomersPage.types';

interface CustomersPageFiltersProps {
    searchTerm: string;
    roleFilter: CustomerRoleFilter;
    hasFilters: boolean;
    onSearchTermChange: (value: string) => void;
    onRoleFilterChange: (value: CustomerRoleFilter) => void;
    onClearFilters: () => void;
}

export default function CustomersPageFilters({
    searchTerm,
    roleFilter,
    hasFilters,
    onSearchTermChange,
    onRoleFilterChange,
    onClearFilters,
}: CustomersPageFiltersProps) {
    return (
        <div className="flex flex-col gap-4 rounded border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre o email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(event) => onSearchTermChange(event.target.value)}
                />
            </div>

            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <Select value={roleFilter} onValueChange={(value: CustomerRoleFilter) => onRoleFilterChange(value)}>
                    <SelectTrigger className="w-full md:w-[170px]">
                        <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="CLIENT">Clientes</SelectItem>
                        <SelectItem value="ADMIN">Administradores</SelectItem>
                        <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
                    </SelectContent>
                </Select>

                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs">
                        Limpiar filtros
                    </Button>
                )}
            </div>
        </div>
    );
}
