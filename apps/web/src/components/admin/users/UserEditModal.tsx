'use client';

import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { USER_EDIT_TABS } from './UserEditModal.constants';
import { DeactivationReasonDialog } from './UserEditModal.deactivation-dialog';
import { UserEditModalTabsContent } from './UserEditModal.tabs';
import { UserEditModalProps } from './UserEditModal.types';
import { useUserAudit } from './useUserAudit';
import { useUserEditModal } from './useUserEditModal';

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
                        {USER_EDIT_TABS.map((tab) => (
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
