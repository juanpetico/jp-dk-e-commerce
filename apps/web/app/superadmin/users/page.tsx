'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
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
import UserEditModal from '@/components/admin/UserEditModal';
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
    const itemsPerPage = 20;

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
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
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
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
                        <table className="w-full text-left">
                            <thead className="border-b border-border bg-muted/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Rol</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Ultimo Login</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Creado</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {paginatedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                            No se encontraron usuarios.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <tr key={user.id} className="transition-colors hover:bg-muted/40">
                                            <td className="px-6 py-4 text-sm font-semibold text-foreground">{user.email}</td>
                                            <td className="px-6 py-4 text-sm text-foreground">{user.name || 'Sin nombre'}</td>
                                            <td className="px-6 py-4">
                                                <span className="rounded-sm bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-zinc-200 text-zinc-700'}`}>
                                                    {user.isActive ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground">{formatDate(user.lastLogin)}</td>
                                            <td className="px-6 py-4 text-sm text-foreground">{formatDate(user.createdAt)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="outline" size="sm" onClick={() => openEditModal(user.id)}>
                                                    Editar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {!loading && !error && (
                    <div className="flex items-center justify-between border-t border-border px-6 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>

                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Pagina {currentPage} de {totalPages}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage >= totalPages}
                        >
                            Siguiente
                        </Button>
                    </div>
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
