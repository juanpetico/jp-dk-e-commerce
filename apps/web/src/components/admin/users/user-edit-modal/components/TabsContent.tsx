import React from 'react';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock,
    Loader2,
    Mail,
    Shield,
    ShieldAlert,
    ShieldCheck,
    ToggleRight,
    User,
    Users,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminUser, AuditEntry, UserRole } from '@/types';
import { ModalTab } from '../types';
import { formatDate, roleLabel } from '../utils';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface TabsContentProps {
    activeTab: ModalTab;
    user: AdminUser;
    selectedRole: UserRole;
    isOwnUser: boolean;
    saving: boolean;
    auditItems: AuditEntry[];
    auditNextCursor: string | null;
    loadingAudit: boolean;
    onRoleChange: (value: UserRole) => void;
    onSaveRole: () => void;
    onToggleStatus: () => void;
    onLoadMoreAudit: () => void;
}

// ─── Audit constants (mirrors audit/page.tsx) ─────────────────────────────────

const ACTION_CONFIG: Record<string, { label: string; className: string }> = {
    ROLE_CHANGE:          { label: 'Cambio de rol',         className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    STATUS_CHANGE:        { label: 'Cambio de estado',       className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    PRODUCT_CREATED:      { label: 'Producto creado',        className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_DELETED:      { label: 'Producto eliminado',     className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_PRICE_CHANGE: { label: 'Precio de producto',     className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_STOCK_CHANGE: { label: 'Stock de producto',      className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_PUBLISHED:    { label: 'Producto publicado',     className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_UNPUBLISHED:  { label: 'Producto despublicado',  className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    ORDER_STATUS_CHANGE:  { label: 'Estado de orden',        className: 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
    CATEGORY_CREATED:     { label: 'Categoría creada',       className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
    CATEGORY_PUBLISHED:   { label: 'Categoría publicada',    className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
    CATEGORY_UNPUBLISHED: { label: 'Categoría despublicada', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
    CATEGORY_DELETED:     { label: 'Categoría eliminada',    className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
    STORE_CONFIG_CHANGE:  { label: 'Configuración',          className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    COUPON_CREATED:       { label: 'Cupón creado',           className: 'bg-violet-200 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' },
    COUPON_UPDATED:       { label: 'Cupón actualizado',      className: 'bg-violet-200 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' },
    COUPON_DELETED:       { label: 'Cupón eliminado',        className: 'bg-violet-200 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' },
    PRODUCT_SALE_CHANGE:  { label: 'Oferta de producto',     className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
};

const ORDER_STATUS_LABELS: Record<string, string> = {
    PENDING:   'Pendiente',
    CONFIRMED: 'Confirmado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
};

const ROLE_LABELS: Record<string, string> = {
    CLIENT:     'Cliente',
    ADMIN:      'Admin',
    SUPERADMIN: 'Superadmin',
};

const SALE_FIELD_LABELS: Record<string, string> = {
    isSale:          'En oferta',
    originalPrice:   'Precio original',
    discountPercent: 'Descuento %',
};

const COUPON_FIELD_LABELS: Record<string, string> = {
    code:        'Código',
    value:       'Valor',
    type:        'Tipo',
    isActive:    'Activo',
    description: 'Descripción',
    minAmount:   'Monto mínimo',
    maxUses:     'Usos máximos',
    isPublic:    'Público',
};

const CONFIG_FIELD_LABELS: Record<string, string> = {
    freeShippingThreshold: 'Envío gratis desde',
    baseShippingCost:      'Costo de envío',
    defaultTaxRate:        'IVA',
    lowStockThreshold:     'Stock mínimo',
    vipThreshold:          'Umbral VIP',
    vipCouponCode:         'Código VIP',
    vipCouponType:         'Tipo VIP',
    vipCouponValue:        'Valor VIP',
    vipRewardMessage:      'Mensaje VIP',
    welcomeCouponCode:     'Código Bienvenida',
    welcomeCouponType:     'Tipo Bienvenida',
    welcomeCouponValue:    'Valor Bienvenida',
};

// ─── Audit helpers ────────────────────────────────────────────────────────────

const formatCLP = (value: string) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(value));

const getProductName = (entry: AuditEntry, fallback?: string | null) => {
    const name = entry.metadata?.productName as string | undefined;
    if (name) return name;
    if (fallback) return fallback;
    return entry.entityId.slice(0, 8);
};

const DiffArrow = () => <ArrowRight className="mx-1 h-3 w-3 shrink-0 text-muted-foreground" />;

const OldVal = ({ children }: { children: React.ReactNode }) => (
    <span className="text-xs text-muted-foreground line-through">{children}</span>
);

const NewVal = ({ children, className = 'text-foreground' }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-xs font-medium ${className}`}>{children}</span>
);

const ActionBadge = ({ action }: { action: string }) => {
    const config = ACTION_CONFIG[action] ?? { label: action, className: 'bg-muted text-muted-foreground' };
    return (
        <span className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.className}`}>
            {config.label}
        </span>
    );
};

const ChangeDetail = ({ entry }: { entry: AuditEntry }) => {
    const { action, oldValue, newValue, metadata } = entry;

    switch (action) {
        case 'ROLE_CHANGE':
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground">{(metadata?.targetEmail as string | undefined) ?? 'Sin correo'}</span>
                    <div className="flex items-center gap-0.5 flex-wrap">
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
            const isActive  = newValue === 'true';
            const reason      = metadata?.deactivationReason as string | undefined;
            const targetEmail = metadata?.targetEmail as string | undefined;
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground">{targetEmail ?? 'Sin correo'}</span>
                    <div className="flex items-center gap-0.5 flex-wrap">
                        <OldVal>{wasActive ? 'Activo' : 'Inactivo'}</OldVal>
                        <DiffArrow />
                        <NewVal className={isActive ? 'text-green-600 dark:text-green-400' : 'text-destructive'}>
                            {isActive ? 'Activo' : 'Inactivo'}
                        </NewVal>
                    </div>
                    {reason && <span className="text-[10px] text-muted-foreground italic">{reason}</span>}
                </div>
            );
        }

        case 'PRODUCT_PRICE_CHANGE': {
            const productName = getProductName(entry);
            return (
                <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">Producto:</span>
                    <span className="text-xs text-muted-foreground mr-1">{productName}</span>
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
                <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">Producto:</span>
                    <span className="text-xs text-muted-foreground mr-1">{productName}</span>
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
                <div className="flex items-center gap-0.5 flex-wrap">
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
            try { oldObj = JSON.parse(oldValue ?? '{}'); } catch { /* empty */ }
            try { newObj = JSON.parse(newValue ?? '{}'); } catch { /* empty */ }
            return (
                <div className="flex flex-col gap-0.5">
                    {Object.keys(newObj).map((key) => (
                        <div key={key} className="flex items-center gap-0.5 flex-wrap">
                            <span className="text-[10px] text-muted-foreground mr-1">{CONFIG_FIELD_LABELS[key] ?? key}:</span>
                            <OldVal>{String(oldObj[key] ?? '—')}</OldVal>
                            <DiffArrow />
                            <NewVal className="text-amber-600 dark:text-amber-400">{String(newObj[key] ?? '—')}</NewVal>
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
            const wasVisible  = oldValue === 'true';
            const isVisible   = newValue === 'true';
            const categoryName = (metadata?.categoryName as string | undefined) ?? 'Categoría';
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground">{categoryName}</span>
                    <div className="flex items-center gap-0.5 flex-wrap">
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
            const couponCode  = (metadata?.couponCode as string | undefined) ?? newValue;
            const couponValue = metadata?.value as string | undefined;
            const couponType  = metadata?.type as string | undefined;
            const desc        = metadata?.description as string | undefined;
            return (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <NewVal className="text-emerald-600 dark:text-emerald-400">Creado</NewVal>
                        <span className="text-[10px] text-muted-foreground">{couponCode ?? '—'}</span>
                    </div>
                    {(couponType || couponValue) && (
                        <div className="flex items-center gap-1.5">
                            {couponType && <span className="text-[10px] text-muted-foreground">{couponType === 'PERCENTAGE' ? 'Descuento %' : 'Monto fijo'}</span>}
                            {couponValue && (
                                <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">
                                    {couponType === 'PERCENTAGE' ? `${couponValue}%` : formatCLP(couponValue)}
                                </span>
                            )}
                        </div>
                    )}
                    {desc && <span className="text-[10px] text-muted-foreground italic">{desc}</span>}
                </div>
            );
        }

        case 'COUPON_UPDATED': {
            let oldObj: Record<string, unknown> = {};
            let newObj: Record<string, unknown> = {};
            try { oldObj = JSON.parse(oldValue ?? '{}'); } catch { /* empty */ }
            try { newObj = JSON.parse(newValue ?? '{}'); } catch { /* empty */ }
            const couponCode = metadata?.couponCode as string | undefined;
            return (
                <div className="flex flex-col gap-0.5">
                    {couponCode && <span className="text-[10px] font-mono font-bold text-muted-foreground mb-0.5">{couponCode}</span>}
                    {Object.keys(newObj).map((key) => (
                        <div key={key} className="flex items-center gap-0.5 flex-wrap">
                            <span className="text-[10px] text-muted-foreground mr-1">{COUPON_FIELD_LABELS[key] ?? key}:</span>
                            <OldVal>{String(oldObj[key] ?? '—')}</OldVal>
                            <DiffArrow />
                            <NewVal className="text-violet-600 dark:text-violet-400">{String(newObj[key] ?? '—')}</NewVal>
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
                        <span className="text-xs font-mono text-muted-foreground line-through opacity-70">{deletedCode ?? '—'}</span>
                    </div>
                    {deletedDesc && <span className="text-[10px] text-muted-foreground italic opacity-70">{deletedDesc}</span>}
                </div>
            );
        }

        case 'PRODUCT_SALE_CHANGE': {
            let oldObj: Record<string, unknown> = {};
            let newObj: Record<string, unknown> = {};
            try { oldObj = JSON.parse(oldValue ?? '{}'); } catch { /* empty */ }
            try { newObj = JSON.parse(newValue ?? '{}'); } catch { /* empty */ }
            const productName = getProductName(entry);
            return (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">Producto:</span>
                        <span className="text-xs text-muted-foreground">{productName}</span>
                    </div>
                    {Object.keys(newObj).map((key) => (
                        <div key={key} className="flex items-center gap-0.5 flex-wrap">
                            <span className="text-[10px] text-muted-foreground mr-1">{SALE_FIELD_LABELS[key] ?? key}:</span>
                            <OldVal>{String(oldObj[key] ?? '—')}</OldVal>
                            <DiffArrow />
                            <NewVal className="text-pink-600 dark:text-pink-400">{String(newObj[key] ?? '—')}</NewVal>
                        </div>
                    ))}
                </div>
            );
        }

        default:
            if (oldValue || newValue) {
                return (
                    <div className="flex items-center gap-0.5 flex-wrap">
                        {oldValue && <OldVal>{oldValue}</OldVal>}
                        {oldValue && newValue && <DiffArrow />}
                        {newValue && <NewVal>{newValue}</NewVal>}
                    </div>
                );
            }
            return <span className="text-xs text-muted-foreground">—</span>;
    }
};

// ─── Profile tab helpers ───────────────────────────────────────────────────────

const InfoField = ({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: React.ReactNode;
    icon: React.ElementType;
}) => (
    <div className="rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40">
        <div className="flex items-center gap-2 mb-1.5">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        </div>
        <p className="text-sm font-semibold text-foreground leading-snug">{value}</p>
    </div>
);

// ─── Role tab helpers ─────────────────────────────────────────────────────────

const ROLE_CARDS: Array<{
    value: UserRole;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
}> = [
    {
        value: 'CLIENT',
        label: 'Cliente',
        description: 'Acceso a la tienda, historial de pedidos y perfil personal.',
        icon: Users,
        color: 'text-sky-500',
    },
    {
        value: 'ADMIN',
        label: 'Administrador',
        description: 'Gestión de productos, pedidos, cupones y usuarios del panel.',
        icon: Shield,
        color: 'text-violet-500',
    },
    {
        value: 'SUPERADMIN',
        label: 'Superadmin',
        description: 'Acceso total: configuración del sistema, logs y superusuarios.',
        icon: ShieldCheck,
        color: 'text-amber-500',
    },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function UserEditModalTabsContent({
    activeTab,
    user,
    selectedRole,
    isOwnUser,
    saving,
    auditItems,
    auditNextCursor,
    loadingAudit,
    onRoleChange,
    onSaveRole,
    onToggleStatus,
    onLoadMoreAudit,
}: TabsContentProps) {

    /* ── PROFILE ── */
    if (activeTab === 'PROFILE') {
        return (
            <div className="grid grid-cols-2 gap-3">
                <InfoField label="Nombre" value={user.name || <span className="italic text-muted-foreground">Sin nombre</span>} icon={User} />
                <InfoField label="Correo" value={user.email} icon={Mail} />
                <InfoField label="Rol actual" value={roleLabel(user.role)} icon={Shield} />
                <InfoField
                    label="Estado"
                    value={
                        <span className={`inline-flex items-center gap-1 ${user.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                            {user.isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                            {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    }
                    icon={CheckCircle2}
                />
                <InfoField label="Último login" value={formatDate(user.lastLogin)} icon={Clock} />
                <InfoField label="Creado" value={formatDate(user.createdAt)} icon={CalendarDays} />
            </div>
        );
    }

    /* ── ROLE ── */
    if (activeTab === 'ROLE') {
        const hasChanged = selectedRole !== user.role;
        return (
            <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                    Selecciona el nuevo rol. Los cambios quedan registrados en auditoría.
                </p>

                <div className="grid gap-3">
                    {ROLE_CARDS.map(({ value, label, description, icon: Icon, color }) => {
                        const isSelected = selectedRole === value;
                        const isCurrent  = user.role === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                disabled={isOwnUser || saving}
                                onClick={() => onRoleChange(value)}
                                className={`group flex w-full cursor-pointer items-start gap-4 rounded-xl border-2 p-4 text-left transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                                    isSelected
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border bg-muted/10 hover:border-border/80 hover:bg-muted/30'
                                }`}
                            >
                                <div className={`mt-0.5 rounded-lg bg-muted p-2 ${isSelected ? color : 'text-muted-foreground'}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-semibold ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                                            {label}
                                        </span>
                                        {isCurrent && (
                                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                Actual
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                                </div>
                                {isSelected && <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />}
                            </button>
                        );
                    })}
                </div>

                {isOwnUser && (
                    <p className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                        No puedes modificar tu propio rol.
                    </p>
                )}

                <div className="flex items-center justify-end pt-1">
                    <Button onClick={onSaveRole} disabled={saving || isOwnUser || !hasChanged} size="sm">
                        {saving ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Guardando...</> : 'Guardar rol'}
                    </Button>
                </div>
            </div>
        );
    }

    /* ── STATUS ── */
    if (activeTab === 'STATUS') {
        return (
            <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                    Activa o desactiva cuentas. Una cuenta inactiva no puede iniciar sesión.
                </p>

                <div className={`flex items-center gap-4 rounded-xl border-2 p-4 ${
                    user.isActive
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-destructive/20 bg-destructive/5'
                }`}>
                    <div className={`rounded-full p-2.5 ${user.isActive ? 'bg-emerald-500/15' : 'bg-destructive/15'}`}>
                        {user.isActive
                            ? <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            : <XCircle className="h-5 w-5 text-destructive" />
                        }
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Estado actual</p>
                        <p className={`text-sm font-bold ${user.isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}`}>
                            {user.isActive ? 'Cuenta activa' : 'Cuenta inactiva'}
                        </p>
                    </div>
                </div>

                {!user.isActive && user.deactivationReason && (
                    <div className="rounded-lg border border-border bg-muted/20 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                            Motivo de desactivación
                        </p>
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{user.deactivationReason}</p>
                    </div>
                )}

                {user.isActive && !isOwnUser && (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
                        <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            Al desactivar esta cuenta el usuario perderá acceso de inmediato. Se solicitará un motivo de desactivación.
                        </p>
                    </div>
                )}

                {isOwnUser && (
                    <p className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                        No puedes modificar tu propio estado.
                    </p>
                )}

                <div className="flex items-center justify-end pt-1">
                    <Button variant={user.isActive ? 'destructive' : 'default'} size="sm" onClick={onToggleStatus} disabled={saving || isOwnUser}>
                        {saving
                            ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Guardando...</>
                            : <><ToggleRight className="mr-2 h-3.5 w-3.5" />{user.isActive ? 'Desactivar cuenta' : 'Activar cuenta'}</>
                        }
                    </Button>
                </div>
            </div>
        );
    }

    /* ── AUDIT ── */
    return (
        <div className="flex flex-col gap-4">
            {loadingAudit && auditItems.length === 0 ? (
                <div className="flex min-h-[160px] items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando auditoría...
                </div>
            ) : auditItems.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    Sin eventos de auditoría para este usuario.
                </div>
            ) : (
                <>
                    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                        {auditItems.map((item) => (
                            <div key={item.id} className="rounded-md border border-border bg-muted/10 p-3 hover:bg-muted/20 transition-colors">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <ActionBadge action={item.action} />
                                        <ChangeDetail entry={item} />
                                        <p className="text-[10px] text-muted-foreground">
                                            Por{' '}
                                            <span className="font-medium text-foreground/70">
                                                {item.actor.name || 'Sin nombre'}
                                            </span>{' '}
                                            <span className="opacity-60">({item.actor.email})</span>
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                            {formatDate(item.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {auditNextCursor && (
                        <Button type="button" variant="outline" size="sm" onClick={onLoadMoreAudit} disabled={loadingAudit} className="w-full">
                            {loadingAudit
                                ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Cargando...</>
                                : 'Cargar más eventos'
                            }
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
