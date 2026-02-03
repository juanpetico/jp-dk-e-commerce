export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string;
    sizes: string[];
    isNew?: boolean;
    isSale?: boolean;
    description?: string;
}

export interface CartItem extends Product {
    selectedSize: string;
    quantity: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface CartState {
    items: CartItem[];
    isOpen: boolean;
    total: number;
}
