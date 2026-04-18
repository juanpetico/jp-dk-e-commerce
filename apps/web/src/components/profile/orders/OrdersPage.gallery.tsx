import Link from 'next/link';
import { getProductImageFallbackDataUrl } from '@/lib/product-image-fallback';
import { OrdersPageGalleryProps } from './OrdersPage.types';
import { formatOrderPrice, getOrderItemsCount, getOrderSavingsAmount, getOrderStatusIcon, translateOrderStatus } from './OrdersPage.utils';

export default function OrdersPageGallery({ orders }: OrdersPageGalleryProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => {
                const firstItem = order.items[0];
                const savingsAmount = getOrderSavingsAmount(order);

                return (
                    <Link key={order.id} href={`/orders/${order.id}`} className="block">
                        <div className="bg-card text-card-foreground border border-gray-300 dark:border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="mb-6 inline-flex items-center gap-2">
                                {getOrderStatusIcon(order.status)}
                                <div>
                                    <p className="text-xs font-bold text-foreground uppercase">{translateOrderStatus(order.status)}</p>
                                    <p className="text-xs text-muted-foreground">{order.date}</p>
                                </div>
                            </div>

                            {firstItem && (
                                <div className="flex flex-col gap-4 mb-6">
                                    <div className="w-full aspect-square bg-muted rounded overflow-hidden">
                                        <img
                                            src={firstItem.product.images[0]?.url || getProductImageFallbackDataUrl()}
                                            alt={firstItem.product.name}
                                            onError={(event) => {
                                                const target = event.currentTarget;
                                                if (target.src !== getProductImageFallbackDataUrl()) {
                                                    target.src = getProductImageFallbackDataUrl();
                                                }
                                            }}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-lg uppercase leading-tight text-foreground">
                                            {firstItem.product.name}
                                        </h3>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-200 dark:border-border pt-4">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-bold text-foreground">Cantidad: {getOrderItemsCount(order)}</p>
                                    {savingsAmount > 0 && (
                                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                                            Ahorraste {formatOrderPrice(savingsAmount)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mb-4">Pedido #{order.id}</p>

                                <p className="text-lg font-bold text-foreground">{formatOrderPrice(order.total)}</p>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
