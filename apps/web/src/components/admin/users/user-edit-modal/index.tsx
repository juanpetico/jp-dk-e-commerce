'use client';

import React from 'react';
import { ClipboardList, Loader2, Shield, ToggleLeft, User, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { USER_EDIT_TABS } from './constants';
import { DeactivationReasonDialog } from './components/DeactivationReasonDialog';
import { UserEditModalTabsContent } from './components/TabsContent';
import { useUserAudit } from './hooks/useUserAudit';
import { useUserEditModal } from './hooks/useUserEditModal';
import { UserEditModalProps } from './types';

const TAB_ICONS: Record<string, React.ElementType<React.SVGProps<SVGSVGElement>>> = {
    PROFILE: User,
    ROLE: Shield,
    STATUS: ToggleLeft,
    AUDIT: ClipboardList,
};

function getInitials(name: string | null | undefined, email: string): string {
    if (name && name.trim()) {
        const parts = name.trim().split(' ');
        if (parts.length >= 2 && parts[0] && parts[1]) {
            return (parts[0][0]! + parts[1][0]!).toUpperCase();
        }
        return (parts[0] ?? email).slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
}

export default function UserEditModal({ userId, open, onClose, onUpdated }: UserEditModalProps) {
    const {
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
    } = useUserEditModal({ userId, open, onClose, onUpdated });

    const { auditItems, auditNextCursor, loadingAudit, loadAudit } = useUserAudit({ userId, open, activeTab });

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative z-10 w-full max-w-3xl rounded-2xl border border-border bg-background shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm shrink-0">
                            {user ? getInitials(user.name, user.email) : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-display text-lg font-black uppercase tracking-tight text-foreground leading-none">
                                    Gestionar Usuario
                                </h2>
                                {user && (
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                            user.isActive
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-destructive/10 text-destructive'
                                        }`}
                                    >
                                        {user.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                )}
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {user ? user.email : 'Cargando información del usuario...'}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="border-b border-border px-6 bg-muted/10">
                    <div className="flex gap-1">
                        {USER_EDIT_TABS.map((tab) => {
                            const Icon = TAB_ICONS[tab.key] ?? User;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-semibold uppercase tracking-wide transition-colors duration-150 ${
                                        isActive
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loadingUser ? (
                        <div className="flex min-h-[240px] items-center justify-center gap-3 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Cargando usuario...</span>
                        </div>
                    ) : !user ? (
                        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                            Usuario no encontrado.
                        </div>
                    ) : (
                        <UserEditModalTabsContent
                            activeTab={activeTab}
                            user={user}
                            selectedRole={selectedRole}
                            isOwnUser={isOwnUser}
                            saving={saving}
                            auditItems={auditItems}
                            auditNextCursor={auditNextCursor}
                            loadingAudit={loadingAudit}
                            onRoleChange={setSelectedRole}
                            onSaveRole={handleRoleSave}
                            onToggleStatus={handleToggleStatus}
                            onLoadMoreAudit={() => loadAudit(true)}
                        />
                    )}
                </div>
            </div>

            <DeactivationReasonDialog
                open={isReasonModalOpen}
                saving={saving}
                value={deactivationReasonInput}
                onChange={setDeactivationReasonInput}
                onClose={() => setIsReasonModalOpen(false)}
                onConfirm={handleConfirmDeactivation}
            />
        </div>
    );
}
