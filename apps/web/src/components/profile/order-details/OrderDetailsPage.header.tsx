import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OrderDetailsHeaderProps } from './OrderDetailsPage.types';

export default function OrderDetailsPageHeader({ order, onBackToHome, onExportPdf }: OrderDetailsHeaderProps) {
    return (
        <div className="flex justify-between items-start mb-8">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Link href="/orders" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-display text-2xl font-bold text-foreground">Pedido #{order.id}</h1>
                </div>
                <p className="text-sm text-muted-foreground ml-7">Fecha de confirmacion: {order.date}</p>
            </div>

            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={onExportPdf}
                    className="gap-2 border-gray-300 hover:border-gray-400"
                >
                    <FileText className="w-4 h-4" />
                    Exportar PDF
                </Button>
                <Button
                    variant="outline"
                    onClick={onBackToHome}
                    className="border-gray-300 hover:border-gray-400"
                >
                    Volver a comprar
                </Button>
            </div>
        </div>
    );
}
