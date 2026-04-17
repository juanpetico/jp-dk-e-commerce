import { Check } from 'lucide-react';
import { OrderDetailsContactCardProps } from './OrderDetailsPage.types';

export default function OrderDetailsContactCard({
    shipping,
    billing,
    email,
    shippingMethod,
}: OrderDetailsContactCardProps) {
    return (
        <div className="flex-1 space-y-6">
            <div className="bg-card border border-gray-300 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="text-green-600 dark:text-green-400">
                        <Check className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-foreground">Pedido confirmado</p>
                        <p className="text-xs text-muted-foreground">Informacion de despacho y facturacion</p>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-gray-300 rounded-lg p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold text-sm mb-4 text-foreground">Informacion de contacto</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>{shipping.name}</p>
                            <p>{email}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-sm mb-4 text-foreground">Direccion de facturacion</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>{billing.name}</p>
                            {billing.company && <p className="text-sm">{billing.company}</p>}
                            <p>{billing.rut}</p>
                            <p>{billing.street}</p>
                            <p>{billing.comuna}, {billing.region}</p>
                            {billing.zipCode && <p>CP: {billing.zipCode}</p>}
                            <p>{billing.country}</p>
                            <p>{billing.phone}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-sm mb-4 text-foreground">Direccion de envio</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>{shipping.name}</p>
                            <p>{shipping.rut}</p>
                            <p>{shipping.street}</p>
                            <p>{shipping.comuna}, {shipping.region}</p>
                            {shipping.zipCode && <p>CP: {shipping.zipCode}</p>}
                            <p>{shipping.country}</p>
                            <p>{shipping.phone}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-sm mb-4 text-foreground">Metodo de envio</h3>
                    <p className="text-sm text-muted-foreground">{shippingMethod || 'Estandar'}</p>
                </div>
            </div>
        </div>
    );
}
