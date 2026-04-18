import React from 'react';
import { AuditEntry } from '@/types';
import {
    CONFIG_FIELD_LABELS,
    COUPON_FIELD_LABELS,
    ORDER_STATUS_LABELS,
    ROLE_LABELS,
    SALE_FIELD_LABELS,
} from './AuditPage.constants';
import { formatCLP, getProductName } from './AuditPage.utils';
import { DiffArrow, NewVal, OldVal } from './AuditPage.badges';

export default function ChangeDetail({ entry }: { entry: AuditEntry }) {
    const { action, oldValue, newValue, metadata } = entry;

    switch (action) {
        case 'ROLE_CHANGE':
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground">
                        {(metadata?.targetEmail as string | undefined) ?? 'Sin correo'}
                    </span>
                    <div className="flex flex-wrap items-center gap-0.5">
                        <OldVal>{ROLE_LABELS[oldValue ?? ''] ?? oldValue ?? '—'}</OldVal>
                        <DiffArrow />
                        <NewVal className="text-blue-600 dark:text-blue-400">
                            {ROLE_LABELS[newValue ?? ''] ?? newValue ?? '—'}
                        </NewVal>
                    </div>
                </div>
            );

        case 'STATUS_CHANGE': {
            const wasActive = oldValue === 'true';
            const isActive = newValue === 'true';
            const reason = metadata?.deactivationReason as string | undefined;
            const targetEmail = metadata?.targetEmail as string | undefined;

            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground">{targetEmail ?? 'Sin correo'}</span>
                    <div className="flex flex-wrap items-center gap-0.5">
                        <OldVal>{wasActive ? 'Activo' : 'Inactivo'}</OldVal>
                        <DiffArrow />
                        <NewVal className={isActive ? 'text-green-600 dark:text-green-400' : 'text-destructive'}>
                            {isActive ? 'Activo' : 'Inactivo'}
                        </NewVal>
                    </div>
                    {reason && <span className="text-[10px] italic text-muted-foreground">{reason}</span>}
                </div>
            );
        }

        case 'PRODUCT_PRICE_CHANGE': {
            const productName = getProductName(entry);
            return (
                <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">Producto:</span>
                    <span className="mr-1 text-xs text-muted-foreground">{productName}</span>
                    <span className="text-[10px] text-muted-foreground">Precio:</span>
                    <OldVal>{formatCLP(oldValue ?? '0')}</OldVal>
                    <DiffArrow />
                    <NewVal className="text-purple-600 dark:text-purple-400">{formatCLP(newValue ?? '0')}</NewVal>
                </div>
            );
        }

        case 'PRODUCT_STOCK_CHANGE': {
            const size = metadata?.size as string | undefined;
            const productName = getProductName(entry);
            return (
                <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">Producto:</span>
                    <span className="mr-1 text-xs text-muted-foreground">{productName}</span>
                    {size && <span className="text-[10px] text-muted-foreground">Talla: {size}</span>}
                    <OldVal>{oldValue ?? '—'}</OldVal>
                    <DiffArrow />
                    <NewVal className="text-cyan-600 dark:text-cyan-400">{newValue ?? '—'}</NewVal>
                </div>
            );
        }

        case 'PRODUCT_PUBLISHED':
        case 'PRODUCT_UNPUBLISHED': {
            const name = getProductName(entry);
            const isPublished = action === 'PRODUCT_PUBLISHED';
            return (
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Producto:</span>
                    <span className="text-xs text-muted-foreground">{name}</span>
                    <NewVal className={isPublished ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>
                        {isPublished ? 'Publicado' : 'No publicado'}
                    </NewVal>
                </div>
            );
        }

        case 'ORDER_STATUS_CHANGE':
            return (
                <div className="flex flex-wrap items-center gap-0.5">
                    <OldVal>{ORDER_STATUS_LABELS[oldValue ?? ''] ?? oldValue ?? '—'}</OldVal>
                    <DiffArrow />
                    <NewVal className="text-indigo-600 dark:text-indigo-400">
                        {ORDER_STATUS_LABELS[newValue ?? ''] ?? newValue ?? '—'}
                    </NewVal>
                </div>
            );

        case 'STORE_CONFIG_CHANGE': {
            let oldObj: Record<string, unknown> = {};
            let newObj: Record<string, unknown> = {};
            try {
                oldObj = JSON.parse(oldValue ?? '{}');
            } catch {}
            try {
                newObj = JSON.parse(newValue ?? '{}');
            } catch {}
            const keys = Object.keys(newObj);

            return (
                <div className="flex flex-col gap-0.5">
                    {keys.map((key) => (
                        <div key={key} className="flex flex-wrap items-center gap-0.5">
                            <span className="mr-1 text-[10px] text-muted-foreground">{CONFIG_FIELD_LABELS[key] ?? key}:</span>
                            <OldVal>{String(oldObj[key] ?? '—')}</OldVal>
                            <DiffArrow />
                            <NewVal className="text-amber-600 dark:text-amber-400">
                                {String(newObj[key] ?? '—')}
                            </NewVal>
                        </div>
                    ))}
                </div>
            );
        }

        case 'PRODUCT_CREATED': {
            const name = getProductName(entry, newValue);
            return (
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Producto:</span>
                    <span className="text-xs text-muted-foreground">{name}</span>
                    <NewVal className="text-emerald-600 dark:text-emerald-400">Creado</NewVal>
                </div>
            );
        }

        case 'PRODUCT_DELETED': {
            const name = getProductName(entry, oldValue);
            return (
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Producto:</span>
                    <span className="text-xs text-muted-foreground">{name}</span>
                    <NewVal className="text-destructive">Eliminado</NewVal>
                </div>
            );
        }

        case 'CATEGORY_CREATED':
            return <span className="text-xs text-muted-foreground">{newValue ?? '—'}</span>;

        case 'CATEGORY_PUBLISHED':
        case 'CATEGORY_UNPUBLISHED': {
            const wasVisible = oldValue === 'true';
            const isVisible = newValue === 'true';
            const categoryName = (metadata?.categoryName as string | undefined) ?? 'Categoria';

            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground">{categoryName}</span>
                    <div className="flex flex-wrap items-center gap-0.5">
                        <OldVal>{wasVisible ? 'Visible' : 'Oculta'}</OldVal>
                        <DiffArrow />
                        <NewVal className={isVisible ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}>
                            {isVisible ? 'Visible' : 'Oculta'}
                        </NewVal>
                    </div>
                </div>
            );
        }

        case 'CATEGORY_DELETED':
            return <span className="text-xs text-muted-foreground line-through opacity-70">{oldValue ?? '—'}</span>;

        case 'COUPON_CREATED': {
            const couponCode = (metadata?.couponCode as string | undefined) ?? newValue;
            const couponValue = metadata?.value as string | undefined;
            const couponType = metadata?.type as string | undefined;
            const description = metadata?.description as string | undefined;

            return (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <NewVal className="text-emerald-600 dark:text-emerald-400">Creado</NewVal>
                        <span className="mr-1 text-[10px] text-muted-foreground">{couponCode ?? '—'}</span>
                    </div>
                    {(couponType || couponValue) && (
                        <div className="flex items-center gap-1.5">
                            {couponType && (
                                <span className="text-[10px] text-muted-foreground">
                                    {couponType === 'PERCENTAGE' ? 'Descuento %' : 'Monto fijo'}
                                </span>
                            )}
                            {couponValue && (
                                <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">
                                    {couponType === 'PERCENTAGE' ? `${couponValue}%` : formatCLP(couponValue)}
                                </span>
                            )}
                        </div>
                    )}
                    {description && <span className="text-[10px] italic text-muted-foreground">{description}</span>}
                </div>
            );
        }

        case 'COUPON_UPDATED': {
            let oldObj: Record<string, unknown> = {};
            let newObj: Record<string, unknown> = {};
            try {
                oldObj = JSON.parse(oldValue ?? '{}');
            } catch {}
            try {
                newObj = JSON.parse(newValue ?? '{}');
            } catch {}

            const couponCode = metadata?.couponCode as string | undefined;
            const keys = Object.keys(newObj);

            return (
                <div className="flex flex-col gap-0.5">
                    {couponCode && <span className="mb-0.5 font-mono text-[10px] font-bold text-muted-foreground">{couponCode}</span>}
                    {keys.map((key) => (
                        <div key={key} className="flex flex-wrap items-center gap-0.5">
                            <span className="mr-1 text-[10px] text-muted-foreground">{COUPON_FIELD_LABELS[key] ?? key}:</span>
                            <OldVal>{String(oldObj[key] ?? '—')}</OldVal>
                            <DiffArrow />
                            <NewVal className="text-violet-600 dark:text-violet-400">
                                {String(newObj[key] ?? '—')}
                            </NewVal>
                        </div>
                    ))}
                </div>
            );
        }

        case 'COUPON_DELETED': {
            const deletedCode = (metadata?.couponCode as string | undefined) ?? oldValue;
            const deletedDesc = metadata?.description as string | undefined;

            return (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <NewVal className="text-destructive">Eliminado</NewVal>
                        <span className="text-xs font-mono text-muted-foreground line-through opacity-70">
                            {deletedCode ?? '—'}
                        </span>
                    </div>
                    {deletedDesc && <span className="text-[10px] italic text-muted-foreground opacity-70">{deletedDesc}</span>}
                </div>
            );
        }

        case 'PRODUCT_SALE_CHANGE': {
            let oldObj: Record<string, unknown> = {};
            let newObj: Record<string, unknown> = {};
            try {
                oldObj = JSON.parse(oldValue ?? '{}');
            } catch {}
            try {
                newObj = JSON.parse(newValue ?? '{}');
            } catch {}

            const productName = getProductName(entry);
            const keys = Object.keys(newObj);

            return (
                <div className="flex flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">Producto:</span>
                        <span className="text-xs text-muted-foreground">{productName}</span>
                    </div>
                    {keys.map((key) => (
                        <div key={key} className="flex flex-wrap items-center gap-0.5">
                            <span className="mr-1 text-[10px] text-muted-foreground">{SALE_FIELD_LABELS[key] ?? key}:</span>
                            <OldVal>{String(oldObj[key] ?? '—')}</OldVal>
                            <DiffArrow />
                            <NewVal className="text-pink-600 dark:text-pink-400">
                                {String(newObj[key] ?? '—')}
                            </NewVal>
                        </div>
                    ))}
                </div>
            );
        }

        default:
            if (oldValue || newValue) {
                return (
                    <div className="flex flex-wrap items-center gap-0.5">
                        {oldValue && <OldVal>{oldValue}</OldVal>}
                        {oldValue && newValue && <DiffArrow />}
                        {newValue && <NewVal>{newValue}</NewVal>}
                    </div>
                );
            }

            return <span className="text-xs text-muted-foreground">—</span>;
    }
}
