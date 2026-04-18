import React from 'react';
import { MapPin } from 'lucide-react';
import { AddressesSectionProps } from '../types';
import { EmptyState } from '../components/EmptyState';

export function AddressesSection({ addresses }: AddressesSectionProps) {
    if (addresses.length === 0) {
        return (
            <EmptyState
                icon={<MapPin className="h-8 w-8" />}
                title="Sin direcciones"
                description="Este cliente no tiene direcciones guardadas."
            />
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {addresses.map((address) => (
                <div key={address.id} className="rounded-md border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-foreground">{address.name}</p>
                        {address.isDefault && (
                            <span className="shrink-0 rounded-sm bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase text-background">
                                Por defecto
                            </span>
                        )}
                    </div>

                    {address.rut && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">RUT:</span> {address.rut}
                        </p>
                    )}

                    <p className="mt-0.5 text-xs text-muted-foreground">{address.street}</p>
                    <p className="text-xs text-muted-foreground">
                        {address.comuna}, {address.region}
                    </p>
                    <p className="text-xs text-muted-foreground">{address.phone}</p>
                </div>
            ))}
        </div>
    );
}
