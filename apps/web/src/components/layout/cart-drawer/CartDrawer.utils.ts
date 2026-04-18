import { CartItem, Coupon } from '@/types';

export const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'STD'];

export const PAYMENT_METHODS = [
    {
        name: 'Webpay',
        logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3SeRfess0YS2dilDTs0gGGs13TiiPdpwlvQ&s',
    },
    {
        name: 'Mercado Pago',
        logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj7WLHnmXccsnJareD8U_7cMvz5Q7-cFserg&s',
    },
    {
        name: 'PayPal',
        logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgtdXq-EaaZT-YhPFt9-k8W-mryjwl6_znkw&s',
    },
] as const;

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
};

export const getCartItemCount = (cart: CartItem[]) => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
};

export const getCouponDiscount = (appliedCoupon: Coupon | null, cartTotal: number) => {
    if (!appliedCoupon) {
        return 0;
    }

    if (appliedCoupon.type === 'PERCENTAGE') {
        return Math.round(cartTotal * (appliedCoupon.value / 100));
    }

    return Math.min(appliedCoupon.value, cartTotal);
};
