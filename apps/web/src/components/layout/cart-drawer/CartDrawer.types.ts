import { CartItem, Coupon } from '@/types';
import { MyCoupon } from '@/services/couponService';

export interface CartDrawerItemProps {
    item: CartItem;
    onRemove: (productId: string, size: string) => void;
    onUpdateQuantity: (productId: string, size: string, quantity: number) => void;
    onSizeChange: (item: CartItem, newSize: string) => void;
    formatPrice: (price: number) => string;
}

export interface CartDrawerFreeShippingProps {
    freeShippingEnabled: boolean;
    remainingForFreeShipping: number;
    progressPercentage: number;
    formatPrice: (price: number) => string;
}

export interface CartDrawerDiscountSectionProps {
    appliedCoupon: Coupon | null;
    showDiscountInput: boolean;
    discountCode: string;
    isValidating: boolean;
    isAuthenticated: boolean;
    showWallet: boolean;
    userCoupons: MyCoupon[];
    onOpenDiscountInput: () => void;
    onRemoveCoupon: () => void;
    onDiscountCodeChange: (value: string) => void;
    onApplyCoupon: () => void;
    onToggleWallet: () => void;
    onSelectCouponCode: (code: string) => void;
    onCloseDiscountInput: () => void;
}

export interface CartDrawerFooterProps {
    couponDiscount: number;
    total: number;
    formatPrice: (price: number) => string;
    onClose: () => void;
}
