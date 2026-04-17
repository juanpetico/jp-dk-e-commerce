import { AdminUser, AuditEntry, UserRole } from '@/types';

export type ModalTab = 'PROFILE' | 'ROLE' | 'STATUS' | 'AUDIT';

export interface UserEditModalProps {
    userId: string | null;
    open: boolean;
    onClose: () => void;
    onUpdated?: (user: AdminUser) => void;
}

export interface UserEditModalState {
    activeTab: ModalTab;
    user: AdminUser | null;
    selectedRole: UserRole;
    loadingUser: boolean;
    saving: boolean;
    isOwnUser: boolean;
    isReasonModalOpen: boolean;
    deactivationReasonInput: string;
}

export interface UserAuditState {
    auditItems: AuditEntry[];
    auditNextCursor: string | null;
    loadingAudit: boolean;
}
