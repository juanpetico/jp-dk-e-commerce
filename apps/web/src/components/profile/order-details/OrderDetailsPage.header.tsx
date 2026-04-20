import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OrderDetailsHeaderProps } from './OrderDetailsPage.types';

export default function OrderDetailsPageHeader({ order, onBackToHome, onExportPdf }: OrderDetailsHeaderProps) {
    return (
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:justify-between sm:items-start">
            <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <Link href="/orders" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground break-all">Pedido #{order.id}</h1>
                </div>
                <p className="text-sm text-muted-foreground ml-7">Fecha de confirmacion: {order.date}</p>
            </div>

            <div className="flex flex-wrap gap-3">
                <Button
                    variant="outline"
                    onClick={onExportPdf}
                    className="gap-2 hover:border-gray-400"
                >
                    <FileText className="w-4 h-4" />
                    Boleta
                </Button>
                <Button
                    variant="outline"
                    onClick={onBackToHome}
                    className="hover:border-gray-400"
                >
                    Volver a comprar
                </Button>
            </div>
        </div>
    );
}
