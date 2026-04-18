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
        <div className="flex flex-col gap-4 rounded border border-gray-300 dark:border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <AdminSearchInput
                value={searchTerm}
                onChange={onSearchTermChange}
                placeholder="Buscar por nombre o email..."
                containerClassName="border-0"
                inputClassName="border-gray-300 dark:border-border"
            />

            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <Select value={roleFilter} onValueChange={(value: CustomerRoleFilter) => onRoleFilterChange(value)}>
                    <SelectTrigger
                        className={`w-full border-gray-300 dark:border-border md:w-auto ${
                            roleFilter === 'ALL' ? 'text-muted-foreground' : ''
                        }`}
                    >
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
