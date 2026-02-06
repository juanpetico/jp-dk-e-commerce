'use client';

import React from 'react';
import { Order, OrderStatus } from '../../../src/types';
import { X, User, Phone, Truck, FileText, Package, CheckCircle, ChevronDown } from 'lucide-react';
import { confirm } from '../../utils/confirm';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { cn } from "@/lib/utils";

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
    onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

export default function OrderDetailModal({ isOpen, onClose, order, onStatusChange }: OrderDetailModalProps) {
    if (!isOpen || !order) return null;

    // Snapshot logic: prefer snapshot fields, fall back to relations
    const shipping = {
        name: order.shippingName || order.shippingAddress?.name || 'N/A',
        rut: order.shippingRut || order.shippingAddress?.rut || 'N/A',
        street: order.shippingStreet || order.shippingAddress?.street,
        comuna: order.shippingComuna || order.shippingAddress?.comuna,
        region: order.shippingRegion || order.shippingAddress?.region,
        zipCode: order.shippingZipCode || order.shippingAddress?.zipCode,
        phone: order.shippingPhone || order.shippingAddress?.phone || 'N/A',
        method: order.shippingMethod || 'Estándar', // Snapshot method usually matches order
    };

    const billing = {
        name: order.billingName || order.billingAddress?.name || 'N/A',
        rut: order.billingRut || order.billingAddress?.rut || 'N/A',
        street: order.billingStreet || order.billingAddress?.street,
        comuna: order.billingComuna || order.billingAddress?.comuna,
        region: order.billingRegion || order.billingAddress?.region,
        zipCode: order.billingZipCode || order.billingAddress?.zipCode,
        phone: order.billingPhone || order.billingAddress?.phone,
    };

    const customer = {
        name: order.customerName || order.user?.name || 'Invitado',
        email: order.customerEmail || order.user?.email || 'N/A',
        phone: order.customerPhone || order.user?.phone || 'N/A', // Using user phone or specialized snapshot if available
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(price);
    };

    const handleStatusChange = async (newStatus: string) => {
        const status = newStatus as OrderStatus;
        if (status === 'CANCELLED') {
            const confirmed = await confirm(
                '¿Cancelar Orden?',
                '¿Estás seguro de que deseas cancelar esta orden? Esta acción no se puede deshacer.'
            );
            if (!confirmed) return;
        }

        if (onStatusChange && order) {
            onStatusChange(order.id, status);
        }
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>
            <div className="bg-background w-full max-w-4xl rounded-lg shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-slide-in overflow-hidden border border-border">

                {/* Modal Header */}
                <div className="flex justify-between items-start p-6 border-b border-border">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-foreground">
                                {order.id.slice(0, 8)}
                            </h2>
                            <Select
                                value={order.status}
                                onValueChange={handleStatusChange}
                                disabled={!onStatusChange || order.status === 'CANCELLED'}
                            >
                                <SelectTrigger
                                    className={cn(
                                        "h-7 w-[140px] text-[10px] uppercase font-bold border-2",
                                        getStatusColor(order.status)
                                    )}
                                >
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pendiente</SelectItem>
                                    <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                                    <SelectItem value="SHIPPED">Enviado</SelectItem>
                                    <SelectItem value="DELIVERED">Entregado</SelectItem>
                                    <SelectItem value="CANCELLED" className="text-destructive focus:text-destructive">Cancelar Orden</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Realizado el {new Date(order.createdAt).toLocaleDateString('es-CL', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">

                    {/* 1. Customer Summary */}
                    <div className="mb-6 border border-zinc-300 dark:border-border rounded-xl bg-muted/30 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Left: Cliente */}
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
                            {/* Right: Contacto */}
                            <div className="p-6">
                                <h3 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-3 flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-muted-foreground" />
                                    Contacto
                                </h3>
                                <div>
                                    <p className="font-bold text-foreground text-lg leading-tight">{shipping.phone}</p>
                                    <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mt-1">Móvil Verificado</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Address Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                        {/* Shipping Address Card */}
                        <div className="border border-zinc-300 dark:border-border rounded-xl p-6 bg-card shadow-sm hover:border-foreground transition-colors group">
                            <div className="flex items-center gap-2 mb-4 text-foreground">
                                <Truck className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                <h3 className="font-display font-bold uppercase tracking-wider text-xs">Dirección de Envío</h3>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p className="font-black text-foreground text-base mb-2 uppercase tracking-tight">{shipping.name}</p>
                                <p>{shipping.street}</p>
                                <p>{shipping.comuna}, {shipping.region}</p>
                                <p>{'Chile'}</p>
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

                        {/* Billing Address Card */}
                        <div className="border border-zinc-300 dark:border-border rounded-xl p-6 bg-card shadow-sm hover:border-foreground transition-colors group">
                            <div className="flex items-center gap-2 mb-4 text-foreground">
                                <FileText className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                <h3 className="font-display font-bold uppercase tracking-wider text-xs">Dirección de Facturación</h3>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p className="font-black text-foreground text-base mb-2 uppercase tracking-tight">{billing.name}</p>
                                <p>{billing.street}</p>
                                <p>{billing.comuna}, {billing.region}</p>
                                <p>{'Chile'}</p>
                                <p className="mt-2 font-mono text-xs">RUT: {billing.rut}</p>
                                <p className="text-xs">Tel: {billing.phone}</p>
                            </div>
                        </div>
                    </div>

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

                    <div className="flex justify-end border-t border-zinc-300 dark:border-border pt-6">
                        <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter text-muted-foreground px-1">
                                <span>Subtotal</span>
                                <span className="font-mono text-foreground text-sm">{formatPrice(order.subtotal)}</span>
                            </div>
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
                </div>

                {/* Footer */}
                <div className="border-t border-border p-6 flex justify-end bg-muted/20">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-primary text-primary-foreground rounded-lg font-black uppercase tracking-widest text-[10px] hover:opacity-80 transition-opacity shadow-lg"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

// Nota: Import de CheckCircle añadido arriba en la sección de imports principales.
