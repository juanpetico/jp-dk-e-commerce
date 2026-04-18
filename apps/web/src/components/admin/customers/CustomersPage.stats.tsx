import React from 'react';
import { TrendingUp, UserPlus, Users } from 'lucide-react';

interface CustomersPageStatsProps {
    totalClientes: number;
    gastoPromedioLtv: string;
    nuevosUltimos30Dias: number;
}

export default function CustomersPageStats({
    totalClientes,
    gastoPromedioLtv,
    nuevosUltimos30Dias,
}: CustomersPageStatsProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-300 dark:border-border bg-card p-4">
                <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                    <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Clientes</p>
                    <p className="font-mono text-2xl font-black leading-none">{totalClientes}</p>
                </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-300 dark:border-border bg-card p-4">
                <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Gasto Promedio (LTV)
                    </p>
                    <p className="truncate font-mono text-lg font-black leading-none">{gastoPromedioLtv}</p>
                </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-300 dark:border-border bg-card p-4">
                <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Nuevos (30 días)
                    </p>
                    <p className="font-mono text-2xl font-black leading-none">{nuevosUltimos30Dias}</p>
                </div>
            </div>
        </div>
    );
}
