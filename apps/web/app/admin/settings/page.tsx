'use client';

import React from 'react';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Configuración</h1>
                    <p className="text-muted-foreground text-sm">Gestiona la configuración general de la tienda</p>
                </div>
            </div>
            <div className="bg-card rounded shadow-sm border border-border p-8 flex flex-col items-center justify-center min-h-[400px]">
                <Settings className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">En Construcción</h3>
                <p className="text-muted-foreground text-center max-w-sm">Esta sección está siendo desarrollada. Próximamente podrás gestionar impuestos, envíos y más.</p>
            </div>
        </div>
    );
}
