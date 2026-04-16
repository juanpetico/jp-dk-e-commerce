import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminDashboardHeaderProps {
    onGenerateReport: () => void;
    basePath: '/admin' | '/superadmin';
}

export function AdminDashboardHeader({ onGenerateReport, basePath }: AdminDashboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="font-display text-3xl font-black uppercase tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground text-sm">Resumen financiero y logístico en tiempo real.</p>
            </div>
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    className="text-xs h-10 px-4 border-gray-400 dark:border-border"
                    onClick={onGenerateReport}
                >
                    Ver Reporte
                </Button>
                <Link href={`${basePath}/products?action=new`}>
                    <Button className="text-xs h-10 px-4 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Producto
                    </Button>
                </Link>
            </div>
        </div>
    );
}
