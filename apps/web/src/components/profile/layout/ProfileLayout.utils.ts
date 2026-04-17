import { ProfileNavigationItem } from './ProfileLayout.types';

export const PROFILE_NAVIGATION_ITEMS: ProfileNavigationItem[] = [
    { href: '/orders', label: 'Pedidos' },
    { href: '/profile', label: 'Perfil' },
    { href: '/coupons', label: 'Cupones' },
    { href: '/settings', label: 'Configuracion' },
];

export const getProfileNavLinkClassName = (isActive: boolean) => {
    return [
        'text-sm font-medium transition-colors',
        isActive ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground',
    ].join(' ');
};
