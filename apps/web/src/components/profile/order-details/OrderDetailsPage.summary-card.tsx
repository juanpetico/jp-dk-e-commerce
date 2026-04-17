import { OrderDetailsSummaryCardProps } from './OrderDetailsPage.types';
import { formatOrderPrice, getOrderSavingsForItem } from './OrderDetailsPage.utils';

export default function OrderDetailsSummaryCard({ order }: OrderDetailsSummaryCardProps) {
    return (
        <div className="lg:w-[400px]">
            <div className="bg-card border border-gray-300 rounded-lg p-6 shadow-sm">
                <div className="space-y-6 mb-8 border-b border-gray-200 pb-8">
                    {order.items.map((item) => {
                        const savingsAmount = getOrderSavingsForItem(item);

                        return (
                            <div key={item.id} className="flex gap-4">
                                <div className="relative w-16 h-16 bg-muted rounded flex-shrink-0 overflow-hidden">
                                    <img src={item.product.images[0]?.url} alt={item.product.name} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-display font-medium text-sm text-foreground">{item.product.name}</h4>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <p className="text-xs text-muted-foreground">{item.size}</p>
                                        <p className="text-xs font-bold text-foreground">Cantidad: {item.quantity}</p>
                                        {savingsAmount > 0 && (
                                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                                                Ahorraste {formatOrderPrice(savingsAmount)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="font-medium text-sm text-foreground">{formatOrderPrice(item.price * item.quantity)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="space-y-3 pb-6 border-b border-gray-200 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">{formatOrderPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Envio</span>
                        <span className="text-foreground">{formatOrderPrice(order.shippingCost)}</span>
                    </div>
                    {order.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-medium">
                            <span>Descuento</span>
                            <span>-{formatOrderPrice(order.discountAmount)}</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-baseline mb-2">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <div className="text-right">
                        <span className="text-xs text-muted-foreground mr-2">CLP</span>
                        <span className="text-xl font-bold text-foreground">{formatOrderPrice(order.total).replace('$', '')}</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">Incluye {formatOrderPrice(order.taxes).replace('$', '')} $ de impuestos</p>
            </div>
        </div>
    );
}
