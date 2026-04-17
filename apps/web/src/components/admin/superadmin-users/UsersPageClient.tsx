'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import UserEditModal from '@/components/admin/users/UserEditModal';
import TablePagination from '@/components/admin/shared/TablePagination';
import { AdminUser } from '@/types';
import { getAdminUsers, getUserById } from '@/services/userService';
import UsersPageFilters from './UsersPage.filters';
import UsersPageHeader from './UsersPage.header';
import UsersPageTable from './UsersPage.table';
import { UsersRoleFilter, UsersStatusFilter } from './UsersPage.types';

export default function UsersPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<UsersRoleFilter>('ALL');
    const [statusFilter, setStatusFilter] = useState<UsersStatusFilter>('ALL');

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
            let nextCursor: string | undefined;

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
        } catch (requestError) {
            console.error('Error loading admin users:', requestError);
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

        void openFromQuery();

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
    }, [users, currentPage, itemsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <div className="animate-fade-in space-y-6 text-foreground">
            <UsersPageHeader loading={loading} usersCount={users.length} />

            <UsersPageFilters
                searchInput={searchInput}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                hasFilters={hasFilters}
                onSearchInputChange={setSearchInput}
                onRoleFilterChange={setRoleFilter}
                onStatusFilterChange={setStatusFilter}
                onClearFilters={clearFilters}
            />

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
                        <UsersPageTable
                            users={paginatedUsers}
                            hasFilters={hasFilters}
                            onOpenEdit={openEditModal}
                            onClearFilters={clearFilters}
                        />
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
