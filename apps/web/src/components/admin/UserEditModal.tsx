'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/store/UserContext';
import { confirm } from '@/utils/confirm';
import { AdminUser, AuditEntry, UserRole } from '@/types';
import {
    getUserAuditLog,
    getUserById,
    toggleUserStatus,
    updateUserRole,
} from '@/services/userService';

type ModalTab = 'PROFILE' | 'ROLE' | 'STATUS' | 'AUDIT';

interface UserEditModalProps {
    userId: string | null;
    open: boolean;
    onClose: () => void;
    onUpdated?: (user: AdminUser) => void;
}

const TABS: Array<{ key: ModalTab; label: string }> = [
    { key: 'PROFILE', label: 'Perfil' },
    { key: 'ROLE', label: 'Rol' },
    { key: 'STATUS', label: 'Estado' },
    { key: 'AUDIT', label: 'Auditoria' },
];

const roleLabel = (role: UserRole) => {
    if (role === 'SUPERADMIN') return 'Superadmin';
    if (role === 'ADMIN') return 'Administrador';
    return 'Cliente';
};

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

const mapAuditValue = (value: string | null) => {
    if (value === null) return '-';
    if (value === 'true') return 'Activo';
    if (value === 'false') return 'Inactivo';
    if (value === 'SUPERADMIN') return 'Superadmin';
    if (value === 'ADMIN') return 'Administrador';
    if (value === 'CLIENT') return 'Cliente';
    return value;
};

export default function UserEditModal({ userId, open, onClose, onUpdated }: UserEditModalProps) {
    const { user: currentUser } = useUser();

    const [activeTab, setActiveTab] = useState<ModalTab>('PROFILE');
    const [user, setUser] = useState<AdminUser | null>(null);
    const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENT');
    const [loadingUser, setLoadingUser] = useState(false);
    const [saving, setSaving] = useState(false);

    const [auditItems, setAuditItems] = useState<AuditEntry[]>([]);
    const [auditNextCursor, setAuditNextCursor] = useState<string | null>(null);
    const [loadingAudit, setLoadingAudit] = useState(false);
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [deactivationReasonInput, setDeactivationReasonInput] = useState('');

    const isOwnUser = useMemo(() => {
        return !!(currentUser?.id && user?.id && currentUser.id === user.id);
    }, [currentUser?.id, user?.id]);

    useEffect(() => {
        if (!open || !userId) {
            setUser(null);
            setAuditItems([]);
            setAuditNextCursor(null);
            setActiveTab('PROFILE');
            setIsReasonModalOpen(false);
            setDeactivationReasonInput('');
            return;
        }

        let cancelled = false;

        const loadUser = async () => {
            try {
                setLoadingUser(true);
                const response = await getUserById(userId);

                if (cancelled) return;

                const mappedUser: AdminUser = {
                    id: response.id,
                    email: response.email,
                    name: response.name ?? null,
                    role: response.role as UserRole,
                    isActive: response.status === 'Inactive' ? false : response.isActive ?? true,
                    deactivationReason: response.deactivationReason ?? null,
                    lastLogin: response.lastLogin ?? null,
                    createdAt: response.createdAt ?? new Date().toISOString(),
                };

                setUser(mappedUser);
                setSelectedRole(mappedUser.role);
            } catch (error) {
                console.error('Error loading user detail:', error);
                toast.error('Usuario no encontrado');
                onClose();
            } finally {
                if (!cancelled) {
                    setLoadingUser(false);
                }
            }
        };

        loadUser();

        return () => {
            cancelled = true;
        };
    }, [open, userId, onClose]);

    const loadAudit = async (append = false) => {
        if (!userId) return;

        try {
            setLoadingAudit(true);
            const result = await getUserAuditLog(userId, 10, append ? auditNextCursor ?? undefined : undefined);
            setAuditItems((prev) => (append ? [...prev, ...result.items] : result.items));
            setAuditNextCursor(result.nextCursor);
        } catch (error) {
            console.error('Error loading user audit:', error);
            toast.error('No se pudo cargar la auditoria');
        } finally {
            setLoadingAudit(false);
        }
    };

    useEffect(() => {
        if (!open || activeTab !== 'AUDIT' || !userId) return;
        if (auditItems.length > 0) return;

        loadAudit(false);
    }, [open, activeTab, userId, auditItems.length]);

    const handleRoleSave = async () => {
        if (!user) return;

        if (isOwnUser) {
            toast.error('No puedes modificar tu propio rol');
            return;
        }

        if (selectedRole === user.role) {
            toast.message('No hay cambios de rol para guardar');
            return;
        }

        const accepted = await confirm(
            'Cambiar rol',
            `¿Cambiar el rol de ${user.email} a ${roleLabel(selectedRole)}?`
        );
        if (!accepted) return;

        try {
            setSaving(true);
            const updated = await updateUserRole(user.id, selectedRole);
            setUser(updated);
            setSelectedRole(updated.role);
            onUpdated?.(updated);
            toast.success('Rol actualizado correctamente');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al guardar cambios. Intenta de nuevo.';
            if (/forbidden|403|permiso/i.test(message)) {
                toast.error('No tienes permisos para esta accion');
            } else {
                toast.error('Error al guardar cambios. Intenta de nuevo.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!user) return;

        if (isOwnUser) {
            toast.error('No puedes modificar tu propio estado');
            return;
        }

        const nextIsActive = !user.isActive;

        if (!nextIsActive) {
            setDeactivationReasonInput(user.deactivationReason?.trim() || '');
            setIsReasonModalOpen(true);
            return;
        }

        const accepted = await confirm(
            nextIsActive ? 'Activar cuenta' : 'Desactivar cuenta',
            nextIsActive
                ? 'La cuenta podra iniciar sesion nuevamente.'
                : 'La cuenta no podra iniciar sesion hasta ser reactivada.'
        );
        if (!accepted) return;

        try {
            setSaving(true);
            const updated = await toggleUserStatus(user.id, nextIsActive);
            setUser(updated);
            onUpdated?.(updated);
            toast.success('Estado actualizado correctamente');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al guardar cambios. Intenta de nuevo.';
            if (/forbidden|403|permiso/i.test(message)) {
                toast.error('No tienes permisos para esta accion');
            } else {
                toast.error('Error al guardar cambios. Intenta de nuevo.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDeactivation = async () => {
        if (!user) return;

        const reason = deactivationReasonInput.trim();
        if (!reason) {
            toast.error('Debes ingresar un motivo de desactivacion');
            return;
        }

        try {
            setSaving(true);
            const updated = await toggleUserStatus(user.id, false, reason);
            setUser(updated);
            onUpdated?.(updated);
            setIsReasonModalOpen(false);
            toast.success('Estado actualizado correctamente');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al guardar cambios. Intenta de nuevo.';
            if (/forbidden|403|permiso/i.test(message)) {
                toast.error('No tienes permisos para esta accion');
            } else {
                toast.error(message);
            }
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative z-10 w-full max-w-3xl rounded-2xl border-2 border-foreground/20 bg-background shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-border p-5">
                    <div>
                        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-foreground">
                            Gestionar Usuario
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {user ? user.email : 'Cargando informacion del usuario...'}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="border-b border-border px-5 pt-4">
                    <div className="flex flex-wrap gap-2 pb-4">
                        {TABS.map((tab) => (
                            <Button
                                key={tab.key}
                                type="button"
                                size="sm"
                                variant={activeTab === tab.key ? 'default' : 'outline'}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="max-h-[65vh] overflow-y-auto p-5">
                    {loadingUser ? (
                        <div className="flex min-h-[240px] items-center justify-center gap-3 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Cargando usuario...</span>
                        </div>
                    ) : !user ? (
                        <div className="rounded-md border border-dashed border-border p-6 text-center text-muted-foreground">
                            Usuario no encontrado.
                        </div>
                    ) : (
                        <>
                            {activeTab === 'PROFILE' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-md border border-border p-4">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Nombre</p>
                                        <p className="mt-1 font-semibold text-foreground">{user.name || 'Sin nombre'}</p>
                                    </div>
                                    <div className="rounded-md border border-border p-4">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Correo</p>
                                        <p className="mt-1 font-semibold text-foreground">{user.email}</p>
                                    </div>
                                    <div className="rounded-md border border-border p-4">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Rol actual</p>
                                        <p className="mt-1 font-semibold text-foreground">{roleLabel(user.role)}</p>
                                    </div>
                                    <div className="rounded-md border border-border p-4">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Estado</p>
                                        <p className="mt-1 font-semibold text-foreground">{user.isActive ? 'Activo' : 'Inactivo'}</p>
                                    </div>
                                    <div className="rounded-md border border-border p-4">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Último login</p>
                                        <p className="mt-1 font-semibold text-foreground">{formatDate(user.lastLogin)}</p>
                                    </div>
                                    <div className="rounded-md border border-border p-4">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Creado</p>
                                        <p className="mt-1 font-semibold text-foreground">{formatDate(user.createdAt)}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ROLE' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Ajusta el rol del usuario. Los cambios quedan registrados en auditoria.
                                    </p>

                                    <div className="max-w-sm space-y-2">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Nuevo rol</p>
                                        <Select
                                            value={selectedRole}
                                            onValueChange={(value) => setSelectedRole(value as UserRole)}
                                            disabled={isOwnUser || saving}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un rol" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CLIENT">Cliente</SelectItem>
                                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                                <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {isOwnUser && (
                                        <p className="text-sm text-destructive">No puedes modificar tu propio rol.</p>
                                    )}

                                    <Button onClick={handleRoleSave} disabled={saving || isOwnUser}>
                                        {saving ? 'Guardando...' : 'Guardar rol'}
                                    </Button>
                                </div>
                            )}

                            {activeTab === 'STATUS' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Activa o desactiva cuentas. Si una cuenta queda inactiva no podra iniciar sesion.
                                    </p>

                                    <div className="rounded-md border border-border p-4">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Estado actual</p>
                                        <p className="mt-1 font-semibold text-foreground">{user.isActive ? 'Activo' : 'Inactivo'}</p>
                                    </div>

                                    {!user.isActive && user.deactivationReason && (
                                        <div className="rounded-md border border-border p-4">
                                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Motivo de desactivacion</p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-foreground">
                                                {user.deactivationReason}
                                            </p>
                                        </div>
                                    )}

                                    {isOwnUser && (
                                        <p className="text-sm text-destructive">No puedes modificar tu propio estado.</p>
                                    )}

                                    <Button
                                        variant={user.isActive ? 'destructive' : 'default'}
                                        onClick={handleToggleStatus}
                                        disabled={saving || isOwnUser}
                                    >
                                        {saving
                                            ? 'Guardando...'
                                            : user.isActive
                                                ? 'Desactivar cuenta'
                                                : 'Activar cuenta'}
                                    </Button>
                                </div>
                            )}

                            {activeTab === 'AUDIT' && (
                                <div className="flex flex-col gap-3">
                                    {loadingAudit && auditItems.length === 0 ? (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Cargando auditoria...
                                        </div>
                                    ) : auditItems.length === 0 ? (
                                        <div className="rounded-md border border-dashed border-border p-6 text-center text-muted-foreground">
                                            Sin eventos de auditoria para este usuario.
                                        </div>
                                    ) : (
                                        <>
                                            <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
                                                {auditItems.map((item) => (
                                                    <div key={item.id} className="rounded-md border border-border p-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    {item.action === 'ROLE_CHANGE' ? 'Cambio de rol' : 'Cambio de estado'}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {mapAuditValue(item.oldValue)} {'->'} {mapAuditValue(item.newValue)}
                                                                </p>
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    Por {item.actor.name || 'Sin nombre'} ({item.actor.email})
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(item.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {auditNextCursor && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => loadAudit(true)}
                                                    disabled={loadingAudit}
                                                >
                                                    {loadingAudit ? 'Cargando...' : 'Cargar mas'}
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isReasonModalOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={(e) => { e.stopPropagation(); if (!saving) setIsReasonModalOpen(false); }}
                    />
                    <div className="relative z-10 w-full max-w-lg rounded-xl border-2 bg-background p-5 shadow-2xl">
                        <h3 className="text-lg font-bold text-destructive">Motivo de desactivacion</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Este texto se guardara y se mostrara al usuario cuando intente iniciar sesion.
                        </p>

                        <div className="mt-4 space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Motivo</p>
                            <Textarea
                                value={deactivationReasonInput}
                                onChange={(e) => setDeactivationReasonInput(e.target.value)}
                                placeholder="Ej: Incumplimiento de terminos de uso"
                                rows={4}
                                disabled={saving}
                            />
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); setIsReasonModalOpen(false); }}
                                disabled={saving}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleConfirmDeactivation}
                                disabled={saving}
                            >
                                {saving ? 'Guardando...' : 'Desactivar cuenta'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
