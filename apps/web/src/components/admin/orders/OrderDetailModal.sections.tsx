import React from 'react';
import { FileText, Package, Phone, Truck, User, X } from 'lucide-react';
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
}

export function OrderDetailHeader({ order, onClose, onStatusChange, statusEditable }: OrderDetailHeaderProps) {
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
            <button onClick={onClose} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-6 h-6" />
            </button>
        </div>
    );
}

interface OrderCustomerSummaryProps {
    customer: OrderCustomerSnapshot;
}

export function OrderCustomerSummary({ customer }: OrderCustomerSummaryProps) {
    return (
        <div className="mb-6 border border-zinc-300 dark:border-border rounded-xl bg-muted/30 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-6 border-b md:border-b-0 md:border-r border-zinc-300 dark:border-border">
                    <h3 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-muted-foreground" />
                        Cliente
                    </h3>
                    <div>
                        <p className="font-bold text-foreground text-lg leading-tight">{customer.name}</p>
                        <p className="text-muted-foreground text-sm mt-1">{customer.email}</p>
                    </div>
                </div>
                <div className="p-6">
                    <h3 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-3 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        Contacto
                    </h3>
                    <div>
                        <p className="font-bold text-foreground text-lg leading-tight">{customer.phone}</p>
                        <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mt-1">Móvil Verificado</p>
                    </div>
                </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-zinc-300 dark:border-border rounded-xl p-6 bg-card shadow-sm hover:border-foreground transition-colors group">
                <div className="flex items-center gap-2 mb-4 text-foreground">
                    <Truck className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <h3 className="font-display font-bold uppercase tracking-wider text-xs">Dirección de Envío</h3>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="font-black text-foreground text-base mb-2 uppercase tracking-tight">{shipping.name}</p>
                    <p>{shipping.street}</p>
                    <p>{shipping.comuna}, {shipping.region}</p>
                    <p>Chile</p>
                    {shipping.zipCode && <p className="mt-2 font-mono text-xs">CP: {shipping.zipCode}</p>}
                    {shipping.rut && <p className="font-mono text-xs">RUT: {shipping.rut}</p>}
                    <p className="text-xs">Tel: {shipping.phone}</p>
                    <div className="mt-4 pt-4 border-t border-dashed border-zinc-300 dark:border-border text-[10px] flex justify-between items-center">
                        <span className="font-black text-foreground uppercase tracking-widest">Método</span>
                        <span className="bg-muted text-foreground px-2 py-1 rounded font-black uppercase tracking-tighter">
                            {shipping.method}
                        </span>
                    </div>
                </div>
            </div>

            <div className="border border-zinc-300 dark:border-border rounded-xl p-6 bg-card shadow-sm hover:border-foreground transition-colors group">
                <div className="flex items-center gap-2 mb-4 text-foreground">
                    <FileText className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <h3 className="font-display font-bold uppercase tracking-wider text-xs">Dirección de Facturación</h3>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="font-black text-foreground text-base mb-2 uppercase tracking-tight">{billing.name}</p>
                    {billing.company && <p className="font-bold text-primary text-sm mb-1">{billing.company}</p>}
                    <p>{billing.street}</p>
                    <p>{billing.comuna}, {billing.region}</p>
                    <p>Chile</p>
                    <p className="mt-2 font-mono text-xs">RUT: {billing.rut}</p>
                    <p className="text-xs">Tel: {billing.phone}</p>
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
        <div className="flex justify-end border-t border-zinc-300 dark:border-border pt-6">
            <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter text-muted-foreground px-1">
                    <span>Subtotal</span>
                    <span className="font-mono text-foreground text-sm">{formatPrice(order.subtotal)}</span>
                </div>
                {order.coupon && (
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter text-primary px-1">
                        <span>Cupón: {order.coupon.code}</span>
                        <span className="font-mono text-sm">-{formatPrice(order.discountAmount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter text-muted-foreground px-1">
                    <span>Envío</span>
                    <span className="font-mono text-foreground text-sm">{formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-lg font-black border-t-2 border-dashed border-zinc-400 dark:border-border pt-3 mt-4 px-1">
                    <span className="uppercase tracking-tight text-foreground">Total</span>
                    <span className="text-foreground font-mono">{formatPrice(order.total)}</span>
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
