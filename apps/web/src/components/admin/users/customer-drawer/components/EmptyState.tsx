import React from 'react';
import { EmptyStateProps } from '../types';

export function EmptyState({ icon, title, description }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border p-8 text-center">
            <span className="text-muted-foreground">{icon}</span>
            <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
