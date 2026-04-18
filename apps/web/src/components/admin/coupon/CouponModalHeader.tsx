'use client';

import React from 'react';
import { X } from 'lucide-react';

interface CouponModalHeaderProps {
    onClose: () => void;
    hasInitialData: boolean;
    automationType?: 'WELCOME' | 'VIP' | null;
}

export function CouponModalHeader({ onClose, hasInitialData, automationType }: CouponModalHeaderProps) {
    const title =
        automationType === 'WELCOME' ? 'Editar Cupón de Bienvenida' :
        automationType === 'VIP' ? 'Editar Cupón de Cliente VIP' :
        hasInitialData ? 'Editar Cupón' : 'Nuevo Cupón';

    return (
        <div className="p-6 border-b border-border flex items-center bg-muted/30 relative">
            <button
                onClick={onClose}
                aria-label="Cerrar modal"
                className="absolute left-6 text-muted-foreground hover:text-foreground transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold font-display uppercase tracking-wider text-foreground w-full text-center leading-none">
                {title}
            </h2>
        </div>
    );
}
