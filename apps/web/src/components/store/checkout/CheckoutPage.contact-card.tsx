import Link from 'next/link';
import { Edit2 } from 'lucide-react';
import { CheckoutContactCardProps } from './CheckoutPage.types';

export default function CheckoutPageContactCard({
    email,
    formattedAddress,
    shippingCostLabel,
}: CheckoutContactCardProps) {
    return (
        <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm text-sm">
            <div className="p-4 border-b border-border flex justify-between items-start">
                <div className="flex-1 grid grid-cols-[100px_1fr] gap-2 items-center">
                    <p className="text-muted-foreground text-xs font-medium">Contacto</p>
                    <p className="font-medium text-foreground truncate">{email}</p>
                </div>
                <Link href="/profile" className="text-primary hover:text-primary/80 transition-colors">
                    <Edit2 className="w-4 h-4" />
                </Link>
            </div>
            <div className="p-4 border-b border-border flex justify-between items-start">
                <div className="flex-1 grid grid-cols-[100px_1fr] gap-2 items-center">
                    <p className="text-muted-foreground text-xs font-medium">Enviar a</p>
                    <p className="font-medium text-foreground leading-snug text-xs md:text-sm">{formattedAddress}</p>
                </div>
                <Link href="/profile" className="text-primary hover:text-primary/80 transition-colors">
                    <Edit2 className="w-4 h-4" />
                </Link>
            </div>
            <div className="p-4 flex items-center">
                <div className="flex-1 grid grid-cols-[100px_1fr] gap-2 items-center">
                    <p className="text-muted-foreground text-xs font-medium">Metodo</p>
                    <p className="font-medium text-foreground text-xs md:text-sm">Envio Estandar · <span className="font-bold">{shippingCostLabel}</span></p>
                </div>
            </div>
        </div>
    );
}
