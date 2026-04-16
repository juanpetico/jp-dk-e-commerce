'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Category, Product } from '@/types';
import { fetchCategories } from '@/services/categoryService';
import { FormErrors, FormProduct } from './AdminProductForm.types';
import { buildEmptyForm, buildSlug, formatNumberInput, mapInitialProductToForm } from './AdminProductForm.utils';
import { useAdminProductPricing } from './useAdminProductPricing';

interface UseAdminProductFormParams {
    isOpen: boolean;
    initialData?: Product;
}

export function useAdminProductForm({ isOpen, initialData }: UseAdminProductFormParams) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<FormProduct>(buildEmptyForm([]));
    const [errors, setErrors] = useState<FormErrors>({});
    const { applyFieldPricingRules } = useAdminProductPricing();

    useEffect(() => {
        const loadCategories = async () => {
            const fetched = await fetchCategories();
            setCategories(fetched);
            if (!initialData && fetched.length > 0 && !formData.categoryId) {
                const firstCategory = fetched[0];
                if (firstCategory) {
                    setFormData((prev) => ({
                        ...prev,
                        categoryId: firstCategory.id,
                        category: firstCategory,
                    }));
                }
            }
        };

        loadCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(mapInitialProductToForm(initialData));
        } else {
            setFormData((prev) => buildEmptyForm(categories, prev));
        }
        setErrors({});
    }, [initialData, isOpen, categories]);

    const isEditing = useMemo(() => !!initialData, [initialData]);

    const setFormField = useCallback(<K extends keyof FormProduct>(field: K, value: FormProduct[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field as string]) {
            setErrors((prev) => ({ ...prev, [field as string]: '' }));
        }
    }, [errors]);

    const handleTextFieldChange = useCallback((name: string, value: string) => {
        let processedValue: string | boolean = value;
        if (name === 'price' || name === 'originalPrice' || name === 'helperDiscount') {
            processedValue = formatNumberInput(value);
        }

        setFormData((prev) => {
            const next = { ...prev, [name]: processedValue } as FormProduct;

            if (name === 'name') {
                next.slug = buildSlug(String(processedValue));
            }

            if (name === 'categoryId') {
                const selectedCat = categories.find((c) => c.id === value);
                if (selectedCat) {
                    next.category = selectedCat;
                    next.categoryId = selectedCat.id;
                }
            }

            if (name === 'price' || name === 'originalPrice' || name === 'helperDiscount') {
                return applyFieldPricingRules(prev, next, name);
            }

            return next;
        });

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    }, [applyFieldPricingRules, categories, errors]);

    const setIsSale = useCallback((isSale: boolean) => {
        setFormData((prev) => {
            const next = { ...prev, isSale };
            return applyFieldPricingRules(prev, next, 'isSale');
        });
    }, [applyFieldPricingRules]);

    const toggleSize = useCallback((size: string) => {
        setFormData((prev) => {
            const currentVariants = prev.variants || [];
            const exists = currentVariants.find((v) => v.size === size);
            if (exists) {
                return { ...prev, variants: currentVariants.filter((v) => v.size !== size) };
            }
            return { ...prev, variants: [...currentVariants, { size, stock: '' }] };
        });
    }, []);

    const handleVariantStockChange = useCallback((size: string, value: string) => {
        const processedValue = formatNumberInput(value);
        setFormData((prev) => ({
            ...prev,
            variants: prev.variants.map((v) => (v.size === size ? { ...v, stock: processedValue } : v)),
        }));
    }, []);

    const setCategoryById = useCallback((categoryId: string) => {
        const selectedCat = categories.find((c) => c.id === categoryId);
        if (!selectedCat) return;
        setFormData((prev) => ({ ...prev, category: selectedCat, categoryId: selectedCat.id }));
        if (errors.categoryId) {
            setErrors((prev) => ({ ...prev, categoryId: '' }));
        }
    }, [categories, errors.categoryId]);

    return {
        categories,
        formData,
        setFormData,
        errors,
        setErrors,
        isEditing,
        setFormField,
        handleTextFieldChange,
        setIsSale,
        toggleSize,
        handleVariantStockChange,
        setCategoryById,
    };
}
