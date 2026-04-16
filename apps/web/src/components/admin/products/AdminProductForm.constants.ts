import { FormProduct } from './AdminProductForm.types';

export const PRODUCT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'STD'] as const;

export const MIN_PRICE = 1000;

export const EMPTY_PRODUCT_FORM: FormProduct = {
    name: '',
    slug: '',
    price: '',
    originalPrice: '',
    category: undefined,
    categoryId: '',
    variants: [],
    images: [],
    description: '',
    isNew: true,
    isSale: false,
    helperDiscount: '',
    discountPercent: undefined,
    isPublished: false,
};
