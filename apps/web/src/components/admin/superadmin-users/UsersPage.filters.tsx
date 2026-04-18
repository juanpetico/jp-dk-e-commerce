import React from 'react';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import { Button } from '@/components/ui/Button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UsersRoleFilter, UsersStatusFilter } from './UsersPage.types';

interface UsersPageFiltersProps {
    searchInput: string;
    roleFilter: UsersRoleFilter;
    statusFilter: UsersStatusFilter;
    hasFilters: boolean;
    onSearchInputChange: (value: string) => void;
    onRoleFilterChange: (value: UsersRoleFilter) => void;
    onStatusFilterChange: (value: UsersStatusFilter) => void;
    onClearFilters: () => void;
}

export default function UsersPageFilters({
    searchInput,
    roleFilter,
    statusFilter,
    hasFilters,
    onSearchInputChange,
    onRoleFilterChange,
    onStatusFilterChange,
    onClearFilters,
}: UsersPageFiltersProps) {
    return (
        <div className="flex flex-col gap-4 rounded border border-gray-300 dark:border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <AdminSearchInput
                value={searchInput}
                onChange={onSearchInputChange}
                placeholder="Buscar por email o nombre..."
                containerClassName="border-0"
                inputClassName="border-gray-300 dark:border-border"
            />

            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                <Select value={roleFilter} onValueChange={(value) => onRoleFilterChange(value as UsersRoleFilter)}>
                    <SelectTrigger
                        className={`w-full border-gray-300 dark:border-border md:w-auto ${
                            roleFilter === 'ALL' ? 'text-muted-foreground' : ''
                        }`}
                    >
                        <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos los roles</SelectItem>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as UsersStatusFilter)}>
                    <SelectTrigger
                        className={`w-full border-gray-300 dark:border-border md:w-auto ${
                            statusFilter === 'ALL' ? 'text-muted-foreground' : ''
                        }`}
                    >
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos los estados</SelectItem>
                        <SelectItem value="ACTIVE">Activos</SelectItem>
                        <SelectItem value="INACTIVE">Inactivos</SelectItem>
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
