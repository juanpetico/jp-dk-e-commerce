'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface AdminDataLoadErrorStateProps {
    message: string;
    onRetry?: () => void | Promise<void>;
    minHeightClassName?: string;
}

export default function AdminDataLoadErrorState({
    message,
    onRetry,
    minHeightClassName = 'min-h-[400px]',
}: AdminDataLoadErrorStateProps) {
    const router = useRouter();

    const handleRetry = () => {
        if (onRetry) {
            void onRetry();
            return;
        }

        router.refresh();
    };

    return (
        <div className={`flex ${minHeightClassName} flex-col items-center justify-center gap-4`}>
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <p className="text-center text-muted-foreground">{message}</p>
            <Button onClick={handleRetry} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reintentar
            </Button>
        </div>
    );
}
