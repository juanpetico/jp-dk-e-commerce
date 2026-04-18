import React from 'react';
import { MapPin, ShoppingBag, Ticket } from 'lucide-react';
import { DrawerTab } from './types';

export const TABS: { key: DrawerTab; label: string; icon: React.ReactNode }[] = [
    { key: 'ORDERS', label: 'Pedidos', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { key: 'COUPONS', label: 'Cupones', icon: <Ticket className="w-3.5 h-3.5" /> },
    { key: 'ADDRESSES', label: 'Direcciones', icon: <MapPin className="w-3.5 h-3.5" /> },
];
