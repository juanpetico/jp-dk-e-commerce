'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Plus, Loader2, TrendingUp, DollarSign, Users, Trash2, Eye } from 'lucide-react';
import { fetchAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/services/couponService';
import { fetchAllOrders } from '@/services/orderService';
import { Coupon, Order } from '@/types';
import { toast } from 'sonner';
import CouponModal from '@/components/admin/CouponModal';
import TriggersConfigCard from '@/components/admin/TriggersConfigCard';
import { shopConfigService, StoreConfig } from '@/services/shopConfigService';
import SonnerConfirm from '@/components/ui/SonnerConfirm'; // Import SonnerConfirm

export default function MarketingPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [config, setConfig] = useState<StoreConfig | null>(null);

    // Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => { }
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [couponsData, ordersData, configData] = await Promise.all([
                fetchAllCoupons(),
                fetchAllOrders(),
                shopConfigService.getConfig()
            ]);
            setCoupons(couponsData);
            setOrders(ordersData);
            setConfig(configData);
        } catch (error) {
            console.error('Error loading marketing data:', error);
            toast.error('Error al cargar datos de marketing');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    const getCouponStats = (couponId: string) => {
        const couponOrders = orders.filter(o => o.couponId === couponId);
        const revenue = couponOrders.reduce((sum, o) => sum + o.total, 0);
        const totalDiscount = couponOrders.reduce((sum, o) => sum + o.discountAmount, 0);
        const roi = totalDiscount > 0 ? (revenue / totalDiscount).toFixed(1) : '0';

        return {
            revenue,
            totalDiscount,
            roi,
            count: couponOrders.length
        };
    };

    const handleSaveCoupon = async (couponData: Partial<Coupon> & { vipThreshold?: number; vipRewardMessage?: string }) => {
        try {
            // Extract VIP specific fields to avoid sending them to the Coupon API
            const { vipThreshold, vipRewardMessage, ...cleanCouponData } = couponData;

            if (editingCoupon) {
                await updateCoupon(editingCoupon.id, cleanCouponData);

                // Sync with Shop Config if it's a Fidelity Coupon
                if (config) {
                    const isWelcome = config.welcomeCouponCode && editingCoupon.code.toUpperCase() === config.welcomeCouponCode.toUpperCase();
                    const isVIP = config.vipCouponCode && editingCoupon.code.toUpperCase() === config.vipCouponCode.toUpperCase();

                    if (isWelcome) {
                        await shopConfigService.updateConfig({
                            welcomeCouponCode: cleanCouponData.code?.toUpperCase(),
                            welcomeCouponType: cleanCouponData.type,
                            welcomeCouponValue: cleanCouponData.value
                        });
                        toast.info('Configuración de bienvenida actualizada');
                    } else if (isVIP) {
                        await shopConfigService.updateConfig({
                            vipCouponCode: cleanCouponData.code?.toUpperCase(),
                            vipCouponType: cleanCouponData.type,
                            vipCouponValue: cleanCouponData.value,
                            vipThreshold: vipThreshold,
                            vipRewardMessage: vipRewardMessage
                        });
                        toast.info('Configuración VIP actualizada');
                    }
                }

                toast.success('Cupón actualizado');
            } else {
                await createCoupon(cleanCouponData);
                toast.success('Cupón creado exitosamente');
            }
            loadData();
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Error al procesar el cupón');
        }
    };

    const confirmDelete = async (id: string) => {
        try {
            await deleteCoupon(id);
            toast.success('Cupón eliminado');
            loadData();
        } catch (error) {
            toast.error('No se pudo eliminar el cupón');
        } finally {
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleDeleteCoupon = (id: string, code: string) => {
        setConfirmDialog({
            isOpen: true,
            title: '¿Eliminar cupón?',
            description: `¿Estás seguro de que deseas eliminar el cupón "${code}"? Esta acción no se puede deshacer.`,
            onConfirm: () => confirmDelete(id)
        });
    };

    if (loading && coupons.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Cargando métricas de marketing...</p>
            </div>
        );
    }

    return (
        <div className=" animate-fade-in text-foreground pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Marketing</h1>
                    <p className="text-muted-foreground text-sm">Rendimiento de cupones y campañas</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingCoupon(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs"
                >
                    <PlusCircle className="w-4 h-4" />
                    Crear Cupón
                </Button>
            </div>

            <TriggersConfigCard />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map(coupon => {
                    const stats = getCouponStats(coupon.id);
                    const isExpired = coupon.endDate && new Date(coupon.endDate) < new Date();
                    const status = !coupon.isActive ? 'INACTIVO' : isExpired ? 'EXPIRADO' : 'ACTIVO';

                    return (
                        <div
                            key={coupon.id}
                            onClick={(e) => {
                                if (window.getSelection()?.toString().length === 0) {
                                    setEditingCoupon(coupon);
                                    setIsModalOpen(true);
                                }
                            }}
                            className={`bg-card group hover:shadow-md transition-all cursor-pointer rounded-xl overflow-hidden relative border border-border ${status === 'ACTIVO' ? 'shadow-sm' : 'opacity-80'}`}
                        >
                            <div className="p-6 bg-card">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-display font-bold text-2xl tracking-tighter text-foreground leading-none">{coupon.code}</h3>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                            {coupon.description || 'Sin descripción'}
                                        </p>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${status === 'ACTIVO' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                        status === 'EXPIRADO' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' :
                                            'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                        }`}>
                                        {status}
                                    </span>
                                </div>

                                <div className="mb-6">
                                    <p className="text-4xl font-black tracking-tighter text-foreground">
                                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatPrice(coupon.value)}
                                        <span className="text-sm font-medium text-muted-foreground ml-1 tracking-normal">OFF</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                            <TrendingUp className="w-3 h-3" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">ROI</span>
                                        </div>
                                        <p className="text-xl font-black text-primary font-mono">{stats.roi}x</p>
                                    </div>
                                    <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                            <DollarSign className="w-3 h-3" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Ingresos</span>
                                        </div>
                                        <p className="text-xs font-black text-foreground font-mono">{formatPrice(stats.revenue)}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-[11px]">
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span className="font-bold flex items-center gap-1"><Users className="w-3 h-3" /> Usos</span>
                                        <span className="text-foreground font-black">{coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}</span>
                                    </div>
                                    <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary h-full transition-all duration-500"
                                            style={{ width: `${coupon.maxUses ? Math.min((coupon.usedCount / coupon.maxUses) * 100, 100) : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground pt-1">
                                        <span>Expira</span>
                                        <span className="font-bold">{coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('es-CL') : 'Nunca'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 border-t border-border p-4 flex justify-between items-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">ID: {coupon.id.slice(0, 8)}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCoupon(coupon.id, coupon.code);
                                        }}
                                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                                        title="Eliminar campaña"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingCoupon(coupon);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                                        title="Ver detalles"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <button
                    onClick={() => {
                        setEditingCoupon(null);
                        setIsModalOpen(true);
                    }}
                    className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all group bg-card/50 min-h-[300px]"
                >
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground group-hover:border-primary flex items-center justify-center mb-4 transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">Nuevo Cupón</span>
                </button>
            </div>

            <CouponModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCoupon}
                initialData={editingCoupon}
                automationType={
                    editingCoupon && config
                        ? (config.welcomeCouponCode && editingCoupon.code.toUpperCase() === config.welcomeCouponCode.toUpperCase())
                            ? 'WELCOME'
                            : (config.vipCouponCode && editingCoupon.code.toUpperCase() === config.vipCouponCode.toUpperCase())
                                ? 'VIP'
                                : null
                        : null
                }
                vipConfig={config ? {
                    threshold: config.vipThreshold,
                    message: config.vipRewardMessage
                } : undefined}
            />

            <SonnerConfirm
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                description={confirmDialog.description}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
