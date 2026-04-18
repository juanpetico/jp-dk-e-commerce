import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ProductCardQuickAddProps } from './ProductCard.types';

export default function ProductCardQuickAdd({ isHovered, isInCart, isAdding, onAction }: ProductCardQuickAddProps) {
    return (
        <div
            className={`absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 ${
                isHovered ? 'translate-y-0' : 'translate-y-full'
            }`}
        >
            <Button
                onClick={onAction}
                className={cn(
                    'w-full shadow-lg flex items-center justify-center gap-2 transition-all duration-300 h-10 px-4',
                    isInCart
                        ? 'bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90'
                        : 'bg-white text-black border-white hover:bg-gray-100 dark:bg-zinc-900 dark:text-white dark:border-zinc-800',
                )}
            >
                <AnimatePresence mode="wait">
                    {isAdding ? (
                        <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-bold uppercase tracking-wider">Agregado</span>
                        </motion.div>
                    ) : isInCart ? (
                        <motion.div
                            key="inCart"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2"
                        >
                            <ArrowRight className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Ver Carrito</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="cart"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Anadir</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Button>
        </div>
    );
}
