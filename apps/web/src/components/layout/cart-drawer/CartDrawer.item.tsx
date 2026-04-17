import { Check, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CartDrawerItemProps } from './CartDrawer.types';
import { AVAILABLE_SIZES } from './CartDrawer.utils';

const FALLBACK_IMAGE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23e5e7eb' width='1' height='1'/%3E%3C/svg%3E";

export default function CartDrawerItem({
    item,
    onRemove,
    onUpdateQuantity,
    onSizeChange,
    formatPrice,
}: CartDrawerItemProps) {
    return (
        <div className="flex gap-4 relative group">
            <div className="w-24 h-28 flex-shrink-0 bg-muted overflow-hidden relative rounded-sm border border-gray-300">
                <img src={item.images[0]?.url || FALLBACK_IMAGE} alt={item.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm uppercase leading-tight pr-6">{item.name}</h3>
                    <button
                        onClick={() => onRemove(item.id, item.selectedSize)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{item.selectedSize}</span>

                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground transition-colors outline-none p-1 hover:bg-muted rounded">
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-40" align="start">
                            <Command>
                                <CommandList>
                                    <CommandEmpty>No hay tallas.</CommandEmpty>
                                    <CommandGroup>
                                        {(item.variants?.length ? item.variants.map((variant) => variant.size) : AVAILABLE_SIZES).map((size) => (
                                            <CommandItem
                                                key={size}
                                                value={size}
                                                onSelect={() => onSizeChange(item, size)}
                                                className="text-xs cursor-pointer"
                                            >
                                                <div
                                                    className={cn(
                                                        'mr-2 flex h-3 w-3 items-center justify-center rounded-sm border border-primary',
                                                        item.selectedSize === size
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'opacity-50 [&_svg]:invisible',
                                                    )}
                                                >
                                                    <Check className="h-3 w-3" />
                                                </div>
                                                {size}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center border border-input rounded overflow-hidden h-8">
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                            className="w-8 h-full flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 h-full flex items-center justify-center text-sm font-medium bg-transparent">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                            disabled={item.quantity >= (item.variants?.find((variant) => variant.size === item.selectedSize)?.stock || 0)}
                            className="w-8 h-full flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="text-right">
                        {item.originalPrice && item.originalPrice > item.price && (
                            <p className="text-xs text-muted-foreground line-through text-red-800">
                                {formatPrice(item.originalPrice * item.quantity)}
                            </p>
                        )}
                        <p className="font-bold text-base">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
