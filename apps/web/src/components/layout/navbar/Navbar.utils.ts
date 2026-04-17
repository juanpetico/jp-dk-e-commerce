import { NavbarMenuChild, NavbarMenuItem } from './Navbar.types';

export const FALLBACK_CATEGORIES: NavbarMenuChild[] = [
    { label: 'Poleras', path: '/category/poleras' },
    { label: 'Polerones', path: '/category/polerones' },
    { label: 'Lentes', path: '/category/lentes' },
];

export const PROFILE_HIDDEN_ROUTES = ['/profile', '/orders', '/settings', '/admin', '/superadmin', '/checkout'];

export const getShippingMessage = (freeShippingThreshold: number) => {
    const shippingEnabled = freeShippingThreshold > 0;
    return shippingEnabled
        ? `ENVIO GRATIS POR COMPRAS SOBRE $${freeShippingThreshold.toLocaleString('es-CL')}`
        : 'DESPACHO A TODO CHILE';
};

export const getCartCount = (quantities: number[]) => {
    return quantities.reduce((acc, quantity) => acc + quantity, 0);
};

export const buildMenuItems = (categories: NavbarMenuChild[]): NavbarMenuItem[] => {
    return [
        {
            id: 'catalog',
            type: 'link',
            label: 'Catalogo',
            path: '/catalog',
        },
        {
            id: 'category',
            type: 'accordion',
            label: 'Categoria',
            children: categories,
        },
        {
            id: 'sale',
            type: 'link',
            label: 'Sale',
            path: '/catalog?sale=true',
            isRed: true,
        },
    ];
};

export const sortMenuItems = (menuItems: NavbarMenuItem[]) => {
    return [...menuItems].sort((a, b) => a.label.length - b.label.length);
};
