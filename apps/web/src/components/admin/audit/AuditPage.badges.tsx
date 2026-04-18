import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ACTION_CONFIG } from './AuditPage.constants';

export function ActionBadge({ action }: { action: string }) {
    const config = ACTION_CONFIG[action] ?? { label: action, className: 'bg-muted text-muted-foreground' };

    return (
        <span
            className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.className}`}
        >
            {config.label}
        </span>
    );
}

export function DiffArrow() {
    return <ArrowRight className="mx-1 h-3 w-3 flex-shrink-0 text-muted-foreground" />;
}

export function OldVal({ children }: { children: React.ReactNode }) {
    return <span className="text-xs text-muted-foreground line-through">{children}</span>;
}

export function NewVal({
    children,
    className = 'text-foreground',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <span className={`text-xs font-medium ${className}`}>{children}</span>;
}
