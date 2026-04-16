import React from 'react';
import Link from 'next/link';
import { Check, Edit2, Settings2, Upload, X, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Category } from '@/types';
import { PRODUCT_SIZES } from './AdminProductForm.constants';
import { FormErrors, FormProduct } from './AdminProductForm.types';
import { sortVariantsBySize } from './AdminProductForm.utils';

interface AdminProductFormSectionsProps {
    formData: FormProduct;
    errors: FormErrors;
    categories: Category[];
    basePath: '/admin' | '/superadmin';
    isEditing: boolean;
    onTextChange: (name: string, value: string) => void;
    onToggleSize: (size: string) => void;
    onVariantStockChange: (size: string, value: string) => void;
    onCategorySelect: (categoryId: string) => void;
    onOpenImageModal: (index?: number | null) => void;
    onRemoveImage: (index: number) => void;
    onFlagChange: (name: 'isNew' | 'isPublished', checked: boolean) => void;
    onSaleToggle: (checked: boolean) => void;
}

export function AdminProductFormSections({
    formData,
    errors,
    categories,
    basePath,
    isEditing,
    onTextChange,
    onToggleSize,
    onVariantStockChange,
    onCategorySelect,
    onOpenImageModal,
    onRemoveImage,
    onFlagChange,
    onSaleToggle,
}: AdminProductFormSectionsProps) {
    return (
        <>
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
                        onChange={(e) => onTextChange('name', e.target.value)}
                        className={cn(
                            'bg-muted/50 focus:ring-primary focus:bg-background h-11',
                            errors.name && 'ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive'
                        )}
                        placeholder="Nombre del producto"
                    />
                    {errors.name && <p className="text-destructive text-xs font-medium">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="slug" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                        Slug (URL)
                        {!isEditing && <span className="text-red-500">*</span>}
                        {isEditing && <span className="text-[10px] font-normal normal-case text-muted-foreground/60">(no editable)</span>}
                    </Label>
                    <Input
                        id="slug"
                        type="text"
                        name="slug"
                        value={formData.slug ?? ''}
                        onChange={(e) => onTextChange('slug', e.target.value)}
                        readOnly={isEditing}
                        className={cn(
                            'bg-muted/50 h-11 font-mono text-muted-foreground',
                            !isEditing && 'focus:ring-primary focus:bg-background',
                            isEditing && 'cursor-not-allowed opacity-60 select-none',
                            errors.slug && 'ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive'
                        )}
                        placeholder="slug-del-producto"
                        tabIndex={isEditing ? -1 : undefined}
                    />
                    {errors.slug && <p className="text-destructive text-xs font-medium">{errors.slug}</p>}
                </div>
            </div>

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
                            onChange={(e) => onTextChange('price', e.target.value)}
                            className={cn(
                                'pl-8 bg-muted/50 focus:ring-primary focus:bg-background h-11 font-mono',
                                errors.price && 'ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive'
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
                                    onChange={(e) => onTextChange('originalPrice', e.target.value)}
                                    className={cn(
                                        'pl-8 bg-muted/50 focus:ring-primary focus:bg-background h-11 font-mono',
                                        errors.originalPrice && 'ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive'
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
                                    onChange={(e) => onTextChange('helperDiscount', e.target.value)}
                                    className={cn(
                                        'pr-8 bg-muted/50 focus:ring-primary focus:bg-background h-11 font-mono',
                                        errors.helperDiscount && 'ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive'
                                    )}
                                    placeholder="0"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">Auto-calcula el precio final</p>
                        </div>
                    </>
                )}
            </div>

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
                                        'w-full justify-between bg-muted/50 border-zinc-300 dark:border-transparent hover:bg-muted text-muted-foreground hover:text-foreground font-normal',
                                        formData.categoryId && 'text-foreground font-medium',
                                        errors.categoryId && 'ring-2 ring-destructive bg-destructive/10 text-destructive placeholder:text-destructive'
                                    )}
                                >
                                    {formData.categoryId
                                        ? categories.find((category) => category.id === formData.categoryId)?.name
                                        : 'Selecciona una categoría'}
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
                                                    onSelect={() => onCategorySelect(category.id)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            'mr-2 h-4 w-4',
                                                            formData.categoryId === category.id ? 'opacity-100' : 'opacity-0'
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
                    <Link
                        href={`${basePath}/categories`}
                        target="_blank"
                        className="h-10 px-3 flex items-center gap-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex-shrink-0 uppercase tracking-wider"
                        title="Gestionar categorías"
                    >
                        <Settings2 className="w-3.5 h-3.5" />
                        Gestionar
                    </Link>
                </div>
                {errors.categoryId && <p className="text-destructive text-xs">{errors.categoryId}</p>}
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center">
                        Tallas Disponibles <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                        {PRODUCT_SIZES.map((size) => {
                            const isSelected = !!formData.variants.find((v) => v.size === size);
                            return (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => onToggleSize(size)}
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

                {formData.variants.length > 0 && (
                    <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground block mb-2 text-center">Inventario por Talla</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {sortVariantsBySize(formData.variants, PRODUCT_SIZES).map((variant) => (
                                <div key={variant.size} className="space-y-1">
                                    <div className="flex justify-center items-center px-1">
                                        <span className="text-xs font-bold text-foreground">{variant.size}</span>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            value={variant.stock}
                                            onChange={(e) => onVariantStockChange(variant.size, e.target.value)}
                                            className={cn(
                                                'h-10 text-sm font-mono text-center bg-background border-border focus:ring-1',
                                                (variant.stock === '0' || variant.stock === 0) && 'border-amber-500 ring-amber-500 focus:ring-amber-500'
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

            <div className="space-y-4">
                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center">
                    Imágenes
                </Label>

                <div className="flex flex-wrap gap-4">
                    {formData.images?.map((img, idx) => (
                        <div
                            key={`${img}-${idx}`}
                            className="relative w-20 h-20 rounded-lg overflow-hidden group border border-border cursor-pointer shadow-sm hover:ring-2 hover:ring-primary transition-all"
                            onClick={() => onOpenImageModal(idx)}
                            title="Click para editar URL"
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Edit2 className="w-4 h-4 text-white" />
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveImage(idx);
                                }}
                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => onOpenImageModal()}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-all hover:bg-muted/30"
                    >
                        <Upload className="w-6 h-6" />
                    </button>
                </div>

                <p className="text-[10px] text-muted-foreground italic">Tip: Click en una imagen para editar su URL</p>
            </div>

            <div className="flex gap-6 pt-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isNew"
                        checked={!!formData.isNew}
                        onCheckedChange={(checked) => onFlagChange('isNew', checked === true)}
                    />
                    <Label htmlFor="isNew" className="text-sm font-medium leading-none cursor-pointer">
                        Nuevo Producto
                    </Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id="isSale" checked={!!formData.isSale} onCheckedChange={(checked) => onSaleToggle(checked === true)} />
                    <Label htmlFor="isSale" className="text-sm font-medium leading-none cursor-pointer">
                        En Oferta
                    </Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isPublished"
                        checked={!!formData.isPublished}
                        onCheckedChange={(checked) => onFlagChange('isPublished', checked === true)}
                    />
                    <Label htmlFor="isPublished" className="text-sm font-medium leading-none cursor-pointer">
                        Publicado
                    </Label>
                </div>
            </div>
        </>
    );
}
