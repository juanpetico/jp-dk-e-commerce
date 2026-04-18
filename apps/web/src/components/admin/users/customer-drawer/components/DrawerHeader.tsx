import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { User } from '@/types';

interface DrawerHeaderProps {
    customer: User | null;
    loading: boolean;
    onClose: () => void;
}

export function DrawerHeader({ customer, loading, onClose }: DrawerHeaderProps) {
    return (
        <div className="flex shrink-0 items-start justify-between border-b border-border p-5">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground font-display text-sm font-bold uppercase text-background">
                    {customer ? (customer.name || customer.email).charAt(0) : '?'}
                </div>
                <div>
                    <h2 className="font-display text-xl font-black uppercase leading-tight tracking-tight text-foreground">
                        {loading ? 'Cargando...' : customer?.name || 'Sin nombre'}
                    </h2>
                    <p className="text-xs text-muted-foreground">{customer?.email ?? ''}</p>
                </div>
            </div>

            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                <X className="h-5 w-5" />
            </Button>
        </div>
    );
}
