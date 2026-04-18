'use client';

import { ArrowLeft, Mail } from 'lucide-react';

interface EmailChipProps {
    email: string;
    onBack: () => void;
}

export default function EmailChip({ email, onBack }: EmailChipProps) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/50 p-3">
            <button
                type="button"
                onClick={onBack}
                aria-label="Volver al paso anterior"
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-all duration-200 hover:border-[#78350f]/50 hover:text-[#78350f]"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver
            </button>

            <div className="flex min-w-0 items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#78350f]" />
                <p className="truncate text-sm font-medium">{email}</p>
            </div>
        </div>
    );
}
