import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AdminUser, AuditEntry, UserRole } from '@/types';
import { USER_ROLE_OPTIONS } from '../constants';
import { ModalTab } from '../types';
import { formatDate, mapAuditValue, roleLabel } from '../utils';

interface TabsContentProps {
    activeTab: ModalTab;
    user: AdminUser;
    selectedRole: UserRole;
    isOwnUser: boolean;
    saving: boolean;
    auditItems: AuditEntry[];
    auditNextCursor: string | null;
    loadingAudit: boolean;
    onRoleChange: (value: UserRole) => void;
    onSaveRole: () => void;
    onToggleStatus: () => void;
    onLoadMoreAudit: () => void;
}

const UserInfoCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="rounded-md border border-border p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
);

export function UserEditModalTabsContent({
    activeTab,
    user,
    selectedRole,
    isOwnUser,
    saving,
    auditItems,
    auditNextCursor,
    loadingAudit,
    onRoleChange,
    onSaveRole,
    onToggleStatus,
    onLoadMoreAudit,
}: TabsContentProps) {
    if (activeTab === 'PROFILE') {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                <UserInfoCard label="Nombre" value={user.name || 'Sin nombre'} />
                <UserInfoCard label="Correo" value={user.email} />
                <UserInfoCard label="Rol actual" value={roleLabel(user.role)} />
                <UserInfoCard label="Estado" value={user.isActive ? 'Activo' : 'Inactivo'} />
                <UserInfoCard label="Ultimo login" value={formatDate(user.lastLogin)} />
                <UserInfoCard label="Creado" value={formatDate(user.createdAt)} />
            </div>
        );
    }

    if (activeTab === 'ROLE') {
        return (
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Ajusta el rol del usuario. Los cambios quedan registrados en auditoria.
                </p>

                <div className="max-w-sm space-y-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Nuevo rol</p>
                    <Select
                        value={selectedRole}
                        onValueChange={(value) => onRoleChange(value as UserRole)}
                        disabled={isOwnUser || saving}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                            {USER_ROLE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {isOwnUser && <p className="text-sm text-destructive">No puedes modificar tu propio rol.</p>}

                <Button onClick={onSaveRole} disabled={saving || isOwnUser}>
                    {saving ? 'Guardando...' : 'Guardar rol'}
                </Button>
            </div>
        );
    }

    if (activeTab === 'STATUS') {
        return (
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Activa o desactiva cuentas. Si una cuenta queda inactiva no podra iniciar sesion.
                </p>

                <UserInfoCard label="Estado actual" value={user.isActive ? 'Activo' : 'Inactivo'} />

                {!user.isActive && user.deactivationReason && (
                    <div className="rounded-md border border-border p-4">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Motivo de desactivacion</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-foreground">{user.deactivationReason}</p>
                    </div>
                )}

                {isOwnUser && <p className="text-sm text-destructive">No puedes modificar tu propio estado.</p>}

                <Button
                    variant={user.isActive ? 'destructive' : 'default'}
                    onClick={onToggleStatus}
                    disabled={saving || isOwnUser}
                >
                    {saving ? 'Guardando...' : user.isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
                </Button>
            </div>
        );
    }

    return (
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
                    <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
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
                                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                                        {formatDate(item.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {auditNextCursor && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onLoadMoreAudit}
                            disabled={loadingAudit}
                        >
                            {loadingAudit ? 'Cargando...' : 'Cargar mas'}
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
