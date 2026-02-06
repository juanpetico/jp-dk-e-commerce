import React from 'react';

export default function AuditPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Auditoría del Sistema</h1>
            <p className="text-muted-foreground">Registro de actividades y cambios importantes.</p>

            <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-lg font-medium">Módulo de Auditoría en construcción</p>
                <p className="text-muted-foreground">Aquí podrás ver el historial de cambios y accesos al sistema.</p>
            </div>
        </div>
    );
}
