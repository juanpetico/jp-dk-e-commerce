import React from 'react';
import { Edit } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import TableEmptyState from '@/components/admin/shared/TableEmptyState';
import { AdminUser } from '@/types';
import { formatUsersDate } from './UsersPage.utils';

interface UsersPageTableProps {
    users: AdminUser[];
    hasFilters: boolean;
    onOpenEdit: (userId: string) => void;
    onClearFilters: () => void;
}

export default function UsersPageTable({
    users,
    hasFilters,
    onOpenEdit,
    onClearFilters,
}: UsersPageTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent dark:border-gray-800">
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Rol</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Último Login</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Creado</TableHead>
                    <TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Acciones</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {users.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="px-0 py-0">
                            <TableEmptyState
                                title={hasFilters ? 'No hay usuarios que coincidan' : 'Sin usuarios todavía'}
                                description={
                                    hasFilters
                                        ? 'Intenta con otros filtros o limpia la búsqueda.'
                                        : 'Cuando existan usuarios administrativos, aparecerán aquí.'
                                }
                                actionLabel={hasFilters ? 'Limpiar filtros' : undefined}
                                onAction={hasFilters ? onClearFilters : undefined}
                            />
                        </TableCell>
                    </TableRow>
                ) : (
                    users.map((user) => (
                        <TableRow key={user.id} className="transition-colors hover:bg-muted/40">
                            <TableCell className="px-6 py-4 text-sm font-semibold text-foreground">{user.email}</TableCell>
                            <TableCell className="px-6 py-4 text-sm text-foreground">{user.name || 'Sin nombre'}</TableCell>
                            <TableCell className="px-6 py-4">
                                <span className="rounded-sm bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
                                    {user.role}
                                </span>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                                <span
                                    className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                        user.isActive
                                            ? 'border-green-200 bg-green-100 text-green-800'
                                            : 'bg-zinc-200 text-zinc-700'
                                    }`}
                                >
                                    {user.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-sm text-foreground">{formatUsersDate(user.lastLogin)}</TableCell>
                            <TableCell className="px-6 py-4 text-sm text-foreground">{formatUsersDate(user.createdAt)}</TableCell>
                            <TableCell className="px-6 py-4 text-right">
                                <button
                                    onClick={() => onOpenEdit(user.id)}
                                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    title="Editar"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
