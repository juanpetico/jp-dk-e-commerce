import React from 'react';
import { ExternalLink, FileText, Phone, Truck, User, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Order, OrderStatus } from '@/types';
import {
    formatOrderDate,
    formatPrice,
    getStatusColor,
    OrderAddressSnapshot,
    OrderCustomerSnapshot,
} from './OrderDetailModal.utils';

interface OrderDetailHeaderProps {
    order: Order;
    onClose: () => void;
    onStatusChange: (status: string) => void;
    statusEditable: boolean;
    onRedirect?: () => void;
}

export function OrderDetailHeader({ order, onClose, onStatusChange, statusEditable, onRedirect }: OrderDetailHeaderProps) {
    return (
        <div className="flex justify-between items-start p-6 border-b border-border">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <h2 className="font-display text-2xl font-black uppercase tracking-tight text-foreground">
                        {order.id.slice(0, 8)}
                    </h2>
                    <Select value={order.status} onValueChange={onStatusChange} disabled={!statusEditable}>
                        <SelectTrigger className={cn('h-7 w-[140px] text-[10px] uppercase font-bold rounded-full border-none focus:ring-0 shadow-none', getStatusColor(order.status))}>
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING">Pendiente</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                            <SelectItem value="SHIPPED">Enviado</SelectItem>
                            <SelectItem value="DELIVERED">Entregado</SelectItem>
                            <SelectItem value="CANCELLED">Cancelar</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <p className="text-sm text-muted-foreground">Realizado el {formatOrderDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-1">
                {onRedirect && (
                    <button
                        onClick={onRedirect}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
                        title="Ver en Pedidos"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                )}
                <button onClick={onClose} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-muted">
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}

interface OrderCustomerSummaryProps {
    customer: OrderCustomerSnapshot;
}

export function OrderCustomerSummary({ customer }: OrderCustomerSummaryProps) {
    return (
        <div className="mb-4 border border-zinc-300 dark:border-border rounded-lg bg-muted/20 px-4 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-black text-sm text-foreground uppercase tracking-tight truncate">{customer.name}</span>
            </div>
            <div className="w-px h-4 bg-border shrink-0" />
            <span className="text-xs text-muted-foreground flex-1 text-center truncate">{customer.email}</span>
            <div className="w-px h-4 bg-border shrink-0" />
            <div className="flex items-center gap-1.5 flex-1 justify-end">
                <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground font-mono">{customer.phone}</span>
            </div>
        </div>
    );
}

interface OrderAddressesProps {
    shipping: OrderAddressSnapshot;
    billing: OrderAddressSnapshot;
}

export function OrderAddresses({ shipping, billing }: OrderAddressesProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            <div className="border border-zinc-300 dark:border-border rounded-lg p-3.5 bg-card hover:border-foreground transition-colors group">
                <div className="flex items-center gap-1.5 mb-2 text-foreground">
                    <Truck className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <h3 className="font-display font-bold uppercase tracking-wider text-[10px]">Envío</h3>
                </div>
                <div className="space-y-0.5 text-xs text-muted-foreground">
                    <p className="font-black text-foreground text-xs uppercase tracking-tight">{shipping.name}</p>
                    {shipping.rut && <p className="font-mono">RUT: {shipping.rut}</p>}
                    <p>{shipping.street}</p>
                    <p>{shipping.comuna}, {shipping.region}</p>
                    {shipping.zipCode && <p className="font-mono">CP: {shipping.zipCode}</p>}
                    <p>Tel: {shipping.phone}</p>
                    <div className="mt-2 pt-2 border-t border-dashed border-zinc-300 dark:border-border flex justify-between items-center">
                        <span className="font-black text-foreground uppercase tracking-widest text-[10px]">Método</span>
                        <span className="bg-muted text-foreground px-1.5 py-0.5 rounded font-black uppercase tracking-tighter text-[10px]">
                            {shipping.method}
                        </span>
                    </div>
                </div>
            </div>

            <div className="border border-zinc-300 dark:border-border rounded-lg p-3.5 bg-card hover:border-foreground transition-colors group">
                <div className="flex items-center gap-1.5 mb-2 text-foreground">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <h3 className="font-display font-bold uppercase tracking-wider text-[10px]">Facturación</h3>
                </div>
                <div className="space-y-0.5 text-xs text-muted-foreground">
                    <p className="font-black text-foreground text-xs uppercase tracking-tight">{billing.name}</p>
                    {billing.company && <p className="font-bold text-primary text-xs">{billing.company}</p>}
                    {billing.rut && <p className="font-mono">RUT: {billing.rut}</p>}
                    <p>{billing.street}</p>
                    <p>{billing.comuna}, {billing.region}</p>
                    {billing.phone && <p>Tel: {billing.phone}</p>}
                </div>
            </div>
        </div>
    );
}

interface OrderItemsListProps {
    order: Order;
}

export function OrderItemsList({ order }: OrderItemsListProps) {
    return (
        <>
            <h3 className="font-display text-sm font-black uppercase tracking-widest mb-4 pl-1 text-foreground">Productos</h3>
            <div className="space-y-4 mb-8">
                {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center border-b border-zinc-300 dark:border-border/50 pb-4 last:border-0 last:pb-0">
                        <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0 border border-zinc-300 dark:border-border">
                            {item.product.images[0] && (
                                <img
                                    src={item.product.images[0].url}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-black text-xs uppercase text-foreground leading-tight tracking-tight">{item.product.name}</h4>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter mt-1">
                                Talla: {item.size} • Cantidad: {item.quantity}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-sm text-foreground font-mono">
                                {formatPrice(item.price * item.quantity)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

interface OrderTotalsProps {
    order: Order;
}

export function OrderTotals({ order }: OrderTotalsProps) {
    return (
        <div className="border-t border-zinc-300 dark:border-border bg-muted/10 px-6 py-3">
            <div className="flex items-center justify-end gap-6 flex-wrap">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-tighter text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono text-foreground text-sm">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-tighter text-primary">
                        <span>Cupón{order.coupon ? ` ${order.coupon.code}` : ''}</span>
                        <span className="font-mono text-sm">-{formatPrice(order.discountAmount)}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-tighter text-muted-foreground">
                    <span>Envío</span>
                    <span className="font-mono text-foreground text-sm">{formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex items-center gap-2 text-base font-black border-l-2 border-foreground/30 pl-6">
                    <span className="uppercase tracking-tight text-foreground">Total</span>
                    <span className="text-foreground font-mono text-lg">{formatPrice(order.total)}</span>
                </div>
            </div>
        </div>
    );
}

interface OrderDetailFooterProps {
    onClose: () => void;
}

export function OrderDetailFooter({ onClose }: OrderDetailFooterProps) {
    return (
        <div className="border-t border-border p-6 flex justify-end bg-muted/20">
            <button
                onClick={onClose}
                className="px-8 py-2.5 bg-primary text-primary-foreground rounded-lg font-black uppercase tracking-widest text-[10px] hover:opacity-80 transition-opacity shadow-lg"
            >
                Cerrar
            </button>
        </div>
    );
}
