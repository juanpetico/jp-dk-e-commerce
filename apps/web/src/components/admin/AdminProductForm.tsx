import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Product, Category } from '../../types';
import { X, Upload, Check, Edit2, Plus } from 'lucide-react';
import { fetchCategories } from '../../services/categoryService';
import AdminCategoryForm from './AdminCategoryForm';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import { confirm } from '../../utils/confirm';
import { Input } from '../ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../ui/dialog";
import { Label } from '../ui/label';




interface AdminProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (product: Partial<Product>) => void;
    initialData?: Product;
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'STD'];

interface VariantState {
    size: string;
    stock: string | number;
}

interface FormProduct extends Omit<Partial<Product>, 'images' | 'price' | 'originalPrice' | 'variants' | 'discountPercent'> {
    images: string[];
    price: string | number;
    originalPrice?: string | number;
    variants: VariantState[];
    helperDiscount?: string | number; // Visual helper field for percentage input
    discountPercent?: number; // Actual stored discount percentage
    isPublished: boolean;
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<FormProduct>({
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
        isPublished: false
    });

    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [imageUrlModal, setImageUrlModal] = useState({ isOpen: false, url: '', index: null as number | null });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const toastShownRef = useRef<{ reversion: boolean; priceExceeded: boolean }>({ reversion: false, priceExceeded: false });

    useEffect(() => {
        const loadCategories = async () => {
            const fetched = await fetchCategories();
            setCategories(fetched);
            if (!initialData && fetched.length > 0 && !formData.categoryId) {
                const firstCategory = fetched[0];
                if (firstCategory) {
                    setFormData(prev => ({
                        ...prev,
                        categoryId: firstCategory.id,
                        category: firstCategory
                    }));
                }
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                // Format initial price and stock only if they exist and are numbers
                price: initialData.price ? new Intl.NumberFormat('es-CL').format(initialData.price) : '',
                originalPrice: initialData.originalPrice ? new Intl.NumberFormat('es-CL').format(initialData.originalPrice) : '',
                categoryId: initialData.categoryId || (initialData.category as any)?.id || '',
                images: initialData.images ? initialData.images.map((img: any) => typeof img === 'string' ? img : img.url) : [],
                variants: initialData.variants ? initialData.variants.map((v: any) => ({
                    size: v.size,
                    stock: new Intl.NumberFormat('es-CL').format(v.stock)
                })) : [],
                helperDiscount: initialData.discountPercent || '',
                discountPercent: initialData.discountPercent
            });
        } else {
            setFormData(prev => ({
                name: '',
                slug: '',
                price: '',
                originalPrice: '',
                variants: [],
                images: [],
                description: '',
                isNew: true,
                isSale: false,
                category: prev.category || (categories.length > 0 ? categories[0] : undefined),
                categoryId: prev.categoryId || (categories.length > 0 && categories[0] ? categories[0].id : ''),
                helperDiscount: '',
                discountPercent: undefined,
                isPublished: false
            }));
        }
        setErrors({});
    }, [initialData, isOpen, categories]);



    const formatNumberInput = (value: string) => {
        // Remove all non-numeric chars
        const rawValue = value.replace(/\D/g, '');
        if (!rawValue) return '';
        // Format with dots
        return new Intl.NumberFormat('es-CL').format(parseInt(rawValue));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let processedValue: any = value;

        if (name === 'price' || name === 'originalPrice' || name === 'helperDiscount') {
            // Special handling for formatted inputs
            processedValue = formatNumberInput(value);
        } else if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        }

        setFormData(prev => {
            const newData = { ...prev, [name]: processedValue };

            // Logic to auto-generate slug from name if creating new product
            if (name === 'name' && !initialData) {
                const slug = processedValue.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '');
                newData.slug = slug;
            }

            // PRICE REVERSION LOGIC
            // If unchecking isSale and there's an originalPrice, revert price to original
            if (name === 'isSale' && processedValue === false && prev.originalPrice) {
                // Move originalPrice to price
                newData.price = prev.originalPrice;
                newData.originalPrice = '';
                newData.helperDiscount = '';
                newData.discountPercent = undefined;

                // Show notification outside setState
                if (!toastShownRef.current.reversion) {
                    toastShownRef.current.reversion = true;
                    toast.success('El precio ha vuelto a su valor original');
                    setTimeout(() => { toastShownRef.current.reversion = false; }, 1000);
                }
            } else if (name === 'isSale' && processedValue === false) {
                // Just clear discount fields if no originalPrice
                newData.originalPrice = '';
                newData.helperDiscount = '';
                newData.discountPercent = undefined;
            }

            // SYNCHRONIZATION LOGIC
            // Case 1: User changed helperDiscount -> recalculate price
            if (name === 'helperDiscount' && newData.isSale) {
                const rawOriginalPrice = typeof newData.originalPrice === 'string'
                    ? parseInt(newData.originalPrice.replace(/\./g, ''))
                    : newData.originalPrice;

                const rawDiscount = typeof newData.helperDiscount === 'string'
                    ? parseInt(newData.helperDiscount.replace(/\./g, ''))
                    : newData.helperDiscount;

                if (rawOriginalPrice && rawDiscount && rawDiscount > 0 && rawDiscount <= 100) {
                    // Calculate new price based on discount percentage
                    const calculatedPrice = Math.round(rawOriginalPrice * (1 - rawDiscount / 100));
                    newData.price = new Intl.NumberFormat('es-CL').format(calculatedPrice);
                    newData.discountPercent = rawDiscount;
                }
            }

            // Case 2: User changed originalPrice -> recalculate discount (helperDiscount)
            if (name === 'originalPrice' && newData.isSale) {
                const rawOriginalPrice = typeof newData.originalPrice === 'string'
                    ? parseInt(newData.originalPrice.replace(/\./g, ''))
                    : newData.originalPrice;

                const rawPrice = typeof newData.price === 'string'
                    ? parseInt(newData.price.replace(/\./g, ''))
                    : newData.price;

                if (rawOriginalPrice && rawPrice) {
                    if (rawOriginalPrice > rawPrice) {
                        // Calculate discount percentage from price difference
                        const calculatedDiscount = Math.round(((rawOriginalPrice - rawPrice) / rawOriginalPrice) * 100);
                        if (calculatedDiscount >= 0 && calculatedDiscount <= 100) {
                            newData.helperDiscount = calculatedDiscount.toString();
                            newData.discountPercent = calculatedDiscount;
                        }
                    }
                }
            }

            // Case 3: User changed price manually (and has originalPrice) -> recalculate discountPercent
            if (name === 'price' && newData.isSale && newData.originalPrice) {
                const rawOriginalPrice = typeof newData.originalPrice === 'string'
                    ? parseInt(newData.originalPrice.replace(/\./g, ''))
                    : newData.originalPrice;

                const rawPrice = typeof newData.price === 'string'
                    ? parseInt(newData.price.replace(/\./g, ''))
                    : newData.price;

                if (rawOriginalPrice && rawPrice) {
                    // Prevent price from exceeding originalPrice
                    if (rawPrice >= rawOriginalPrice) {
                        // Revert to previous price and show warning
                        newData.price = prev.price;
                        // Show warning outside setState
                        if (!toastShownRef.current.priceExceeded) {
                            toastShownRef.current.priceExceeded = true;
                            toast.error('El precio no puede ser mayor o igual al precio original');
                            setTimeout(() => { toastShownRef.current.priceExceeded = false; }, 500);
                        }
                    } else if (rawOriginalPrice > 0) {
                        // Calculate discount percentage from price difference
                        const calculatedDiscount = Math.round(((rawOriginalPrice - rawPrice) / rawOriginalPrice) * 100);
                        if (calculatedDiscount >= 0 && calculatedDiscount <= 100) {
                            newData.helperDiscount = calculatedDiscount.toString();
                            newData.discountPercent = calculatedDiscount;
                        }
                    }
                }
            }

            if (name === 'categoryId') {
                const selectedCat = categories.find(c => c.id === value);
                if (selectedCat) {
                    newData.category = selectedCat;
                    newData.categoryId = selectedCat.id;
                }
            }
            return newData;
        });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const toggleSize = (size: string) => {
        setFormData(prev => {
            const currentVariants = prev.variants || [];
            const exists = currentVariants.find(v => v.size === size);
            if (exists) {
                return { ...prev, variants: currentVariants.filter(v => v.size !== size) };
            } else {
                return { ...prev, variants: [...currentVariants, { size, stock: '' }] };
            }
        });
    };

    const handleVariantStockChange = (size: string, value: string) => {
        const processedValue = formatNumberInput(value);
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v => v.size === size ? { ...v, stock: processedValue } : v)
        }));
    };

    const openImageUrlModal = (index: number | null = null) => {
        setImageUrlModal({
            isOpen: true,
            url: index !== null ? formData.images[index] || '' : '',
            index
        });
    };

    const handleSaveImageUrl = () => {
        if (!imageUrlModal.url.trim()) {
            toast.error("Ingresa una URL de imagen");
            return;
        }

        setFormData(prev => {
            const newImages = [...prev.images];
            if (imageUrlModal.index !== null) {
                newImages[imageUrlModal.index] = imageUrlModal.url.trim();
            } else {
                newImages.push(imageUrlModal.url.trim());
            }
            return { ...prev, images: newImages };
        });
        setImageUrlModal({ isOpen: false, url: '', index: null });
    };


    const removeImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering edit
        setFormData(prev => {
            const newImages = [...(prev.images || [])];
            newImages.splice(index, 1);
            return { ...prev, images: newImages };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};


        // Parse numbers back to valid integers for validation and submission
        const rawPrice = typeof formData.price === 'string'
            ? parseInt(formData.price.replace(/\./g, ''))
            : formData.price;

        const rawOriginalPrice = formData.originalPrice && typeof formData.originalPrice === 'string'
            ? parseInt(formData.originalPrice.replace(/\./g, ''))
            : formData.originalPrice;

        // Parse variant stocks
        const parsedVariants = formData.variants.map(v => ({
            size: v.size,
            stock: typeof v.stock === 'string' ? parseInt(v.stock.replace(/\./g, '')) || 0 : v.stock
        }));

        if (!formData.name) newErrors.name = 'El nombre es obligatorio';
        if (!formData.slug) newErrors.slug = 'El slug es obligatorio';
        if (!rawPrice || rawPrice <= 0) newErrors.price = 'El precio debe ser mayor a 0';
        else if (rawPrice < 1000) newErrors.price = 'El precio debe ser al menos $1.000 (Valores menores requieren autorización)';

        if (!formData.variants || formData.variants.length === 0) newErrors.variants = 'Selecciona al menos una talla';
        if (!formData.categoryId) newErrors.categoryId = 'Selecciona una categoría';

        // Validate discount fields when isSale is true
        if (formData.isSale) {
            if (!rawOriginalPrice || (typeof rawOriginalPrice === 'number' && rawOriginalPrice <= 0)) {
                newErrors.originalPrice = 'El precio original es obligatorio cuando el producto está en oferta';
            } else if (typeof rawOriginalPrice === 'number' && rawOriginalPrice < 1000) {
                newErrors.originalPrice = 'El precio original debe ser al menos $1.000';
            }
            const rawDiscount = typeof formData.helperDiscount === 'string'
                ? parseInt(formData.helperDiscount.replace(/\./g, ''))
                : formData.helperDiscount;

            if (!rawDiscount || (typeof rawDiscount === 'number' && (rawDiscount <= 0 || rawDiscount > 100))) {
                newErrors.helperDiscount = 'El descuento debe estar entre 1% y 100%';
            }

            // Validate that originalPrice is greater than price
            if (typeof rawOriginalPrice === 'number' && typeof rawPrice === 'number' && rawOriginalPrice <= rawPrice) {
                newErrors.originalPrice = 'El precio original debe ser mayor al precio con descuento';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Por favor revisa los campos marcados en rojo");
            return;
        }

        const isConfirmed = await confirm(
            initialData ? '¿Guardar Cambios?' : '¿Crear Producto?',
            initialData ? '¿Estás seguro de que deseas actualizar los datos de este producto?' : '¿Deseas crear este nuevo producto en el catálogo?'
        );

        if (!isConfirmed) return;

        const submissionData = {
            ...formData,
            price: rawPrice,
            originalPrice: (typeof rawOriginalPrice === 'number' && rawOriginalPrice > 0) ? rawOriginalPrice : null,
            variants: parsedVariants,
            discountPercent: (typeof formData.discountPercent === 'number' && formData.discountPercent > 0) ? formData.discountPercent : null
        };

        onSubmit(submissionData as any);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-background rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-2 border-foreground/20">
                <div className="p-6 border-b border-border flex items-center bg-muted/30 relative">
                    <button onClick={onClose} className="absolute left-6 text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold font-display uppercase tracking-wider text-foreground w-full text-center">
                        {initialData ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                </div>

                <div className="overflow-y-auto p-6 flex-1">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground flex items-center">
                                    Nombre <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={cn(
                                        "bg-muted/50 focus:ring-primary focus:bg-background h-11",
                                        errors.name && "ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive"
                                    )}
                                    placeholder="Nombre del producto"
                                />
                                {errors.name && <p className="text-destructive text-xs font-medium">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug" className="text-xs font-bold uppercase text-muted-foreground flex items-center">
                                    Slug (URL) <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="slug"
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className={cn(
                                        "bg-muted/50 focus:ring-primary focus:bg-background h-11 font-mono text-muted-foreground",
                                        errors.slug && "ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive"
                                    )}
                                    placeholder="slug-del-producto"
                                />
                                {errors.slug && <p className="text-destructive text-xs font-medium">{errors.slug}</p>}
                            </div>
                        </div>

                        {/* Pricing & Stock */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-xs font-bold uppercase text-muted-foreground flex items-center">
                                    Precio <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                                    <Input
                                        id="price"
                                        type="text"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className={cn(
                                            "pl-8 bg-muted/50 focus:ring-primary focus:bg-background h-11 font-mono",
                                            errors.price && "ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive"
                                        )}
                                        placeholder="0"
                                    />
                                </div>
                                {errors.price && <p className="text-destructive text-xs font-medium">{errors.price}</p>}
                            </div>

                            {formData.isSale && (
                                <>
                                    <div className="space-y-2 animate-fade-in">
                                        <Label htmlFor="originalPrice" className="text-xs font-bold uppercase text-muted-foreground flex items-center">
                                            Precio Original <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                                            <Input
                                                id="originalPrice"
                                                type="text"
                                                name="originalPrice"
                                                value={formData.originalPrice || ''}
                                                onChange={handleChange}
                                                className={cn(
                                                    "pl-8 bg-muted/50 focus:ring-primary focus:bg-background h-11 font-mono",
                                                    errors.originalPrice && "ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive"
                                                )}
                                                placeholder="0"
                                            />
                                        </div>
                                        {errors.originalPrice && <p className="text-destructive text-xs font-medium">{errors.originalPrice}</p>}
                                    </div>
                                    <div className="space-y-2 animate-fade-in">
                                        <Label htmlFor="helperDiscount" className="text-xs font-bold uppercase text-muted-foreground flex items-center">
                                            Descuento (%) <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">%</span>
                                            <Input
                                                id="helperDiscount"
                                                type="text"
                                                name="helperDiscount"
                                                value={formData.helperDiscount || ''}
                                                onChange={handleChange}
                                                className={cn(
                                                    "pr-8 bg-muted/50 focus:ring-primary focus:bg-background h-11 font-mono",
                                                    errors.helperDiscount && "ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive"
                                                )}
                                                placeholder="0"
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Auto-calcula el precio final</p>
                                    </div>
                                </>
                            )}
                            {/* Stock removed from here, now in variants */}
                        </div>

                        {/* Category - Combobox */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center">
                                Categoría <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="flex gap-2 items-center">
                                <div className="relative flex-1 min-w-0">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between bg-muted/50 border-zinc-300 dark:border-transparent hover:bg-muted text-muted-foreground hover:text-foreground font-normal",
                                                    formData.categoryId && "text-foreground font-medium",
                                                    errors.categoryId && "ring-2 ring-destructive bg-destructive/10 text-destructive placeholder:text-destructive"
                                                )}
                                            >
                                                {formData.categoryId
                                                    ? categories.find((category) => category.id === formData.categoryId)?.name
                                                    : "Selecciona una categoría"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar categoría..." />
                                                <CommandList>
                                                    <CommandEmpty>No se encontró la categoría.</CommandEmpty>
                                                    <CommandGroup>
                                                        {categories.map((category) => (
                                                            <CommandItem
                                                                key={category.id}
                                                                value={category.name}
                                                                onSelect={() => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        category: category,
                                                                        categoryId: category.id
                                                                    }));
                                                                    if (errors.categoryId) {
                                                                        setErrors(prev => ({ ...prev, categoryId: '' }));
                                                                    }
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.categoryId === category.id
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {category.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryForm(true)}
                                    className="h-10 w-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex-shrink-0"
                                    title="Crear nueva categoría"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            {errors.categoryId && <p className="text-destructive text-xs">{errors.categoryId}</p>}
                        </div>

                        {/* Variant Selection */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center">
                                    Tallas Disponibles <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <div className="flex gap-2 flex-wrap">
                                    {SIZES.map(size => {
                                        const isSelected = !!formData.variants.find(v => v.size === size);
                                        return (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => toggleSize(size)}
                                                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${isSelected
                                                    ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                                    } ${errors.variants && !isSelected ? 'ring-1 ring-destructive bg-destructive/10' : ''}`}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.variants && <p className="text-destructive text-xs">{errors.variants}</p>}
                            </div>

                            {/* Variant Inventory */}
                            {formData.variants.length > 0 && (
                                <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground block mb-2 text-center">Inventario por Talla</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {[...formData.variants]
                                            .sort((a, b) => SIZES.indexOf(a.size) - SIZES.indexOf(b.size))
                                            .map((variant) => (
                                                <div key={variant.size} className="space-y-1">
                                                    <div className="flex justify-center items-center px-1">
                                                        <span className="text-xs font-bold text-foreground">{variant.size}</span>
                                                    </div>
                                                    <div className="relative">
                                                        <Input
                                                            type="text"
                                                            value={variant.stock}
                                                            onChange={(e) => handleVariantStockChange(variant.size, e.target.value)}
                                                            className={cn(
                                                                "h-10 text-sm font-mono text-center bg-background border-border focus:ring-1",
                                                                (variant.stock === '0' || variant.stock === 0) && "border-amber-500 ring-amber-500 focus:ring-amber-500"
                                                            )}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    {(variant.stock === '0' || variant.stock === 0) && (
                                                        <p className="text-[10px] text-amber-600 dark:text-amber-500 text-center leading-tight animate-in fade-in slide-in-from-top-1">
                                                            Deselecciona si es 0
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Images */}
                        <div className="space-y-4">
                            <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center">
                                Imágenes
                            </Label>

                            <div className="flex flex-wrap gap-4">
                                {formData.images?.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="relative w-20 h-20 rounded-lg overflow-hidden group border border-border cursor-pointer shadow-sm hover:ring-2 hover:ring-primary transition-all"
                                        onClick={() => openImageUrlModal(idx)}
                                        title="Click para editar URL"
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Edit2 className="w-4 h-4 text-white" />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => removeImage(idx, e)}
                                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => openImageUrlModal()}
                                    className="w-20 h-20 rounded-lg border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-all hover:bg-muted/30"
                                >
                                    <Upload className="w-6 h-6" />
                                </button>
                            </div>

                            <p className="text-[10px] text-muted-foreground italic">Tip: Click en una imagen para editar su URL</p>
                        </div>

                        {/* Flags */}
                        <div className="flex gap-6 pt-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isNew"
                                    checked={!!formData.isNew}
                                    onCheckedChange={(checked) => {
                                        setFormData(prev => ({ ...prev, isNew: checked === true }));
                                    }}
                                />
                                <Label
                                    htmlFor="isNew"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    Nuevo Producto
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isSale"
                                    checked={!!formData.isSale}
                                    onCheckedChange={(checked) => {
                                        // Handle the same logic as handleChange but for onCheckedChange
                                        const newValue = checked === true;
                                        setFormData(prev => {
                                            const newData = { ...prev, isSale: newValue };

                                            if (newValue === false && prev.originalPrice) {
                                                newData.price = prev.originalPrice;
                                                newData.originalPrice = '';
                                                newData.helperDiscount = '';
                                                newData.discountPercent = undefined;

                                                if (!toastShownRef.current.reversion) {
                                                    toastShownRef.current.reversion = true;
                                                    toast.success('El precio ha vuelto a su valor original');
                                                    setTimeout(() => { toastShownRef.current.reversion = false; }, 1000);
                                                }
                                            } else if (newValue === false) {
                                                newData.originalPrice = '';
                                                newData.helperDiscount = '';
                                                newData.discountPercent = undefined;
                                            }
                                            return newData;
                                        });
                                    }}
                                />
                                <Label
                                    htmlFor="isSale"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    En Oferta
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isPublished"
                                    checked={!!formData.isPublished}
                                    onCheckedChange={(checked) => {
                                        setFormData(prev => ({ ...prev, isPublished: checked === true }));
                                    }}
                                />
                                <Label
                                    htmlFor="isPublished"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:peer-disabled:opacity-70 cursor-pointer"
                                >
                                    Publicado
                                </Label>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
                    <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        {initialData ? 'Guardar Cambios' : 'Crear Producto'}
                    </Button>
                </div>
            </div >

            {showCategoryForm && (
                <AdminCategoryForm
                    onClose={() => setShowCategoryForm(false)}
                    onSuccess={(newCategory) => {
                        setCategories(prev => [...prev, newCategory]);
                        setFormData(prev => ({
                            ...prev,
                            category: newCategory,
                            categoryId: newCategory.id
                        }));
                    }}
                />
            )}

            <Dialog open={imageUrlModal.isOpen} onOpenChange={(open) => !open && setImageUrlModal(prev => ({ ...prev, isOpen: false }))}>
                <DialogContent className="sm:max-w-md bg-background rounded-2xl shadow-2xl border border-border">
                    <DialogHeader>
                        <DialogTitle className="text-center font-bold uppercase tracking-wider">
                            {imageUrlModal.index !== null ? 'Editar Imagen' : 'Añadir Imagen'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                        <Label htmlFor="imageUrl" className="text-xs font-bold uppercase text-muted-foreground flex items-center mb-2">
                            URL de la Imagen <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="imageUrl"
                            autoFocus
                            placeholder="https://ejemplo.com/imagen.jpg"
                            value={imageUrlModal.url}
                            onChange={(e) => setImageUrlModal(prev => ({ ...prev, url: e.target.value }))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveImageUrl();
                                }
                            }}
                            className="bg-muted/50 border-zinc-300 dark:border-transparent focus:ring-primary h-12"
                        />
                        <p className="text-[10px] text-muted-foreground mt-2 italic">
                            Ingresa una URL directa a la imagen (Unsplash, Cloudinary, etc.)
                        </p>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setImageUrlModal({ isOpen: false, url: '', index: null })}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveImageUrl} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {imageUrlModal.index !== null ? 'Guardar Cambios' : 'Añadir Imagen'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default AdminProductForm;
