'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/store/UserContext';
import { confirm } from '@/utils/confirm';
import { AdminUser, UserRole } from '@/types';
import { getUserById, toggleUserStatus, updateUserRole } from '@/services/userService';
import { ModalTab, UserEditModalProps } from '../types';
import { isPermissionError, roleLabel } from '../utils';

type BaseParams = Pick<UserEditModalProps, 'userId' | 'open' | 'onClose' | 'onUpdated'>;

export function useUserEditModal({ userId, open, onClose, onUpdated }: BaseParams) {
    const { user: currentUser } = useUser();

    const [activeTab, setActiveTab] = useState<ModalTab>('PROFILE');
    const [user, setUser] = useState<AdminUser | null>(null);
    const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENT');
    const [loadingUser, setLoadingUser] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [deactivationReasonInput, setDeactivationReasonInput] = useState('');

    const isOwnUser = useMemo(() => {
        return !!(currentUser?.id && user?.id && currentUser.id === user.id);
    }, [currentUser?.id, user?.id]);

    const resetState = useCallback(() => {
        setUser(null);
        setActiveTab('PROFILE');
        setIsReasonModalOpen(false);
        setDeactivationReasonInput('');
    }, []);

    useEffect(() => {
        if (!open || !userId) {
            resetState();
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
    }, [open, userId, onClose, resetState]);

    const handleRoleSave = useCallback(async () => {
        if (!user) return;

        if (isOwnUser) {
            toast.error('No puedes modificar tu propio rol');
            return;
        }

        if (selectedRole === user.role) {
            toast.message('No hay cambios de rol para guardar');
            return;
        }

        const accepted = await confirm('Cambiar rol', `¿Cambiar el rol de ${user.email} a ${roleLabel(selectedRole)}?`);
        if (!accepted) return;

        try {
            setSaving(true);
            const updated = await updateUserRole(user.id, selectedRole);
            setUser(updated);
            setSelectedRole(updated.role);
            onUpdated?.(updated);
            toast.success('Rol actualizado correctamente');
        } catch (error) {
            if (isPermissionError(error)) {
                toast.error('No tienes permisos para esta accion');
            } else {
                toast.error('Error al guardar cambios. Intenta de nuevo.');
            }
        } finally {
            setSaving(false);
        }
    }, [isOwnUser, onUpdated, selectedRole, user]);

    const handleToggleStatus = useCallback(async () => {
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
            if (isPermissionError(error)) {
                toast.error('No tienes permisos para esta accion');
            } else {
                toast.error('Error al guardar cambios. Intenta de nuevo.');
            }
        } finally {
            setSaving(false);
        }
    }, [isOwnUser, onUpdated, user]);

    const handleConfirmDeactivation = useCallback(async () => {
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
            if (isPermissionError(error)) {
                toast.error('No tienes permisos para esta accion');
            } else {
                const message = error instanceof Error ? error.message : 'Error al guardar cambios. Intenta de nuevo.';
                toast.error(message);
            }
        } finally {
            setSaving(false);
        }
    }, [deactivationReasonInput, onUpdated, user]);

    return {
        activeTab,
        setActiveTab,
        user,
        selectedRole,
        setSelectedRole,
        loadingUser,
        saving,
        isOwnUser,
        isReasonModalOpen,
        setIsReasonModalOpen,
        deactivationReasonInput,
        setDeactivationReasonInput,
        handleRoleSave,
        handleToggleStatus,
        handleConfirmDeactivation,
    };
}
