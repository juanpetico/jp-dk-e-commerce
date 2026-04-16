'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Edit, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import UserEditModal from '@/components/admin/users/UserEditModal';
import TablePagination from '@/components/admin/shared/TablePagination';
import { AdminUser, UserRole } from '@/types';
import { getAdminUsers, getUserById } from '@/services/userService';

const formatDate = (value: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

export default function UsersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'SUPERADMIN'>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const hasFilters = debouncedSearch !== '' || roleFilter !== 'ALL' || statusFilter !== 'ALL';

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, roleFilter, statusFilter]);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const allUsers: AdminUser[] = [];
            let nextCursor: string | undefined = undefined;

            do {
                const result = await getAdminUsers({
                    search: debouncedSearch || undefined,
                    role: roleFilter === 'ALL' ? undefined : roleFilter,
                    status: statusFilter,
                    cursor: nextCursor,
                    limit: 100,
                });

                allUsers.push(...result.users);
                nextCursor = result.nextCursor ?? undefined;
            } while (nextCursor);

            const privilegedUsers = allUsers.filter(
                (user) => user.role === 'ADMIN' || user.role === 'SUPERADMIN'
            );

            setUsers(privilegedUsers);
            setError(null);
        } catch (err) {
            console.error('Error loading admin users:', err);
            setError('No se pudo cargar la lista de usuarios. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, roleFilter, statusFilter]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const clearUserIdQueryParam = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('userId');
        const query = params.toString();
        router.replace(query ? `/superadmin/users?${query}` : '/superadmin/users');
    }, [router, searchParams]);

    useEffect(() => {
        const userIdFromQuery = searchParams.get('userId');
        if (!userIdFromQuery) return;

        let cancelled = false;

        const openFromQuery = async () => {
            try {
                await getUserById(userIdFromQuery);
                if (cancelled) return;

                setSelectedUserId(userIdFromQuery);
                setIsModalOpen(true);
            } catch {
                if (cancelled) return;
                toast.error('Usuario no encontrado');
                clearUserIdQueryParam();
            }
        };

        openFromQuery();

        return () => {
            cancelled = true;
        };
    }, [searchParams, clearUserIdQueryParam]);

    const openEditModal = (userId: string) => {
        setSelectedUserId(userId);
        setIsModalOpen(true);

        const params = new URLSearchParams(searchParams.toString());
        params.set('userId', userId);
        router.replace(`/superadmin/users?${params.toString()}`);
    };

    const closeEditModal = () => {
        setIsModalOpen(false);
        setSelectedUserId(null);
        clearUserIdQueryParam();
    };

    const clearFilters = () => {
        setSearchInput('');
        setDebouncedSearch('');
        setRoleFilter('ALL');
        setStatusFilter('ALL');
    };

    const handleUserUpdated = (updated: AdminUser) => {
        setUsers((prev) => prev.map((user) => (user.id === updated.id ? updated : user)));
    };

    const totalPages = Math.max(1, Math.ceil(users.length / itemsPerPage));
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return users.slice(startIndex, startIndex + itemsPerPage);
    }, [users, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <div className="space-y-6 animate-fade-in text-foreground">
            <div>
                <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Gestion de Usuarios</h1>
                <p className="text-sm text-muted-foreground">Administra roles, estados de cuenta y trazabilidad de cambios.</p>
            </div>

            <div className="flex flex-col gap-4 rounded border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Buscar por email o nombre..."
                        className="pl-10"
                    />
                </div>

                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                    <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as 'ALL' | 'ADMIN' | 'SUPERADMIN')}>
                        <SelectTrigger className="w-full md:w-[170px]">
                            <SelectValue placeholder="Rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los roles</SelectItem>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                            <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'ALL' | 'ACTIVE' | 'INACTIVE')}>
                        <SelectTrigger className="w-full md:w-[170px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los estados</SelectItem>
                            <SelectItem value="ACTIVE">Activos</SelectItem>
                            <SelectItem value="INACTIVE">Inactivos</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                            Limpiar filtros
                        </Button>
                    )}
                </div>
            </div>

            <div className="overflow-hidden rounded border border-border bg-card shadow-sm dark:border-none">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex min-h-[280px] items-center justify-center gap-3 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Cargando usuarios...</span>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center text-destructive">
                            <p>{error}</p>
                            <Button variant="outline" onClick={loadUsers}>Reintentar</Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
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
                                {paginatedUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                            No se encontraron usuarios.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <TableRow key={user.id} className="transition-colors hover:bg-muted/40">
                                            <TableCell className="px-6 py-4 text-sm font-semibold text-foreground">{user.email}</TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-foreground">{user.name || 'Sin nombre'}</TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className="rounded-sm bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
                                                    {user.role}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${user.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-zinc-200 text-zinc-700'}`}>
                                                    {user.isActive ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-foreground">{formatDate(user.lastLogin)}</TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-foreground">{formatDate(user.createdAt)}</TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openEditModal(user.id)}
                                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {!loading && !error && (
                    <TablePagination
                        currentPage={currentPage}
                        totalItems={users.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        className="border-t border-border"
                    />
                )}
            </div>

            <UserEditModal
                userId={selectedUserId}
                open={isModalOpen}
                onClose={closeEditModal}
                onUpdated={handleUserUpdated}
            />
        </div>
    );
}
