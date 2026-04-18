import { Category, Product } from '@/types';
import { EMPTY_PRODUCT_FORM, MIN_PRICE } from './AdminProductForm.constants';
import { FormErrors, FormProduct, VariantState } from './AdminProductForm.types';

export const formatNumberInput = (value: string) => {
    const rawValue = value.replace(/\D/g, '');
    if (!rawValue) return '';
    return new Intl.NumberFormat('es-CL').format(parseInt(rawValue, 10));
};

export const parseNumericInput = (value: string | number | undefined | null) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string' || !value.trim()) return undefined;
    const parsed = parseInt(value.replace(/\./g, ''), 10);
    return Number.isNaN(parsed) ? undefined : parsed;
};

export const buildSlug = (name: string) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

export const mapInitialProductToForm = (initialData: Product): FormProduct => {
    return {
        ...initialData,
        price: initialData.price ? new Intl.NumberFormat('es-CL').format(initialData.price) : '',
        originalPrice: initialData.originalPrice ? new Intl.NumberFormat('es-CL').format(initialData.originalPrice) : '',
        categoryId: initialData.categoryId || initialData.category?.id || '',
        images: initialData.images ? initialData.images.map((img) => (typeof img === 'string' ? img : img.url)) : [],
        variants: initialData.variants
            ? initialData.variants.map((v) => ({
                size: v.size,
                stock: new Intl.NumberFormat('es-CL').format(v.stock),
            }))
            : [],
        helperDiscount: initialData.discountPercent || '',
        discountPercent: initialData.discountPercent,
    };
};

export const buildEmptyForm = (categories: Category[], previous?: FormProduct): FormProduct => {
    const firstCategory = categories[0];

    return {
        ...EMPTY_PRODUCT_FORM,
        category: previous?.category || firstCategory,
        categoryId: previous?.categoryId || firstCategory?.id || '',
    };
};

export const sortVariantsBySize = (variants: VariantState[], sizes: readonly string[]) => {
    return [...variants].sort((a, b) => sizes.indexOf(a.size) - sizes.indexOf(b.size));
};

export interface ValidationResult {
    errors: FormErrors;
    rawPrice: number | undefined;
    rawOriginalPrice: number | undefined;
    rawDiscount: number | undefined;
    parsedVariants: Array<{ size: string; stock: number }>;
}

export const validateProductForm = (formData: FormProduct, isEditing: boolean): ValidationResult => {
    const errors: FormErrors = {};

    const rawPrice = parseNumericInput(formData.price);
    const rawOriginalPrice = parseNumericInput(formData.originalPrice);
    const rawDiscount = parseNumericInput(formData.helperDiscount);

    const parsedVariants = formData.variants.map((v) => ({
        size: v.size,
        stock: parseNumericInput(v.stock) || 0,
    }));

    if (!formData.name) errors.name = 'El nombre es obligatorio';
    if (!isEditing && !formData.slug) errors.slug = 'El slug es obligatorio';

    if (!rawPrice || rawPrice <= 0) {
        errors.price = 'El precio debe ser mayor a 0';
    } else if (rawPrice < MIN_PRICE) {
        errors.price = 'El precio debe ser al menos $1.000 (Valores menores requieren autorización)';
    }

    if (!formData.variants || formData.variants.length === 0) {
        errors.variants = 'Selecciona al menos una talla';
    }

    if (!formData.categoryId) {
        errors.categoryId = 'Selecciona una categoría';
    }

    if (formData.isSale) {
        if (!rawOriginalPrice || rawOriginalPrice <= 0) {
            errors.originalPrice = 'El precio original es obligatorio cuando el producto está en oferta';
        } else if (rawOriginalPrice < MIN_PRICE) {
            errors.originalPrice = 'El precio original debe ser al menos $1.000';
        }

        if (!rawDiscount || rawDiscount <= 0 || rawDiscount > 100) {
            errors.helperDiscount = 'El descuento debe estar entre 1% y 100%';
        }

        if (rawOriginalPrice && rawPrice && rawOriginalPrice <= rawPrice) {
            errors.originalPrice = 'El precio original debe ser mayor al precio con descuento';
        }
    }

    return { errors, rawPrice, rawOriginalPrice, rawDiscount, parsedVariants };
};

export const buildSubmissionData = (
    formData: FormProduct,
    rawPrice: number | undefined,
    rawOriginalPrice: number | undefined,
    parsedVariants: Array<{ size: string; stock: number }>
) => {
    return {
        ...formData,
        price: rawPrice,
        originalPrice: rawOriginalPrice && rawOriginalPrice > 0 ? rawOriginalPrice : null,
        variants: parsedVariants,
        discountPercent: typeof formData.discountPercent === 'number' && formData.discountPercent > 0
            ? formData.discountPercent
            : null,
    };
};
