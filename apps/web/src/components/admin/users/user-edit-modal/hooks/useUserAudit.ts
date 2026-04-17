'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AuditEntry } from '@/types';
import { getUserAuditLog } from '@/services/userService';
import { ModalTab } from '../types';

interface UseUserAuditParams {
    userId: string | null;
    open: boolean;
    activeTab: ModalTab;
}

export function useUserAudit({ userId, open, activeTab }: UseUserAuditParams) {
    const [auditItems, setAuditItems] = useState<AuditEntry[]>([]);
    const [auditNextCursor, setAuditNextCursor] = useState<string | null>(null);
    const [loadingAudit, setLoadingAudit] = useState(false);

    const resetAudit = useCallback(() => {
        setAuditItems([]);
        setAuditNextCursor(null);
        setLoadingAudit(false);
    }, []);

    const loadAudit = useCallback(
        async (append = false) => {
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
        },
        [auditNextCursor, userId]
    );

    useEffect(() => {
        if (!open || !userId) {
            resetAudit();
        }
    }, [open, resetAudit, userId]);

    useEffect(() => {
        if (!open || activeTab !== 'AUDIT' || !userId) return;
        if (auditItems.length > 0) return;

        loadAudit(false);
    }, [open, activeTab, userId, auditItems.length, loadAudit]);

    return {
        auditItems,
        auditNextCursor,
        loadingAudit,
        loadAudit,
        resetAudit,
    };
}
