import Link from 'next/link';
import { Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OrdersPageEmptyProps } from './OrdersPage.types';

export default function OrdersPageEmpty({ isFilterActive, onResetFilters }: OrdersPageEmptyProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-lg border border-gray-300 dark:border-border">
            <div className="bg-muted p-4 rounded-full mb-4">
                <Grid3x3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">
                {isFilterActive ? 'No se encontraron pedidos con estos filtros' : 'No tienes pedidos aun'}
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
                {isFilterActive
                    ? 'Intenta ajustar los criterios de busqueda o limpiar los filtros seleccionados.'
                    : 'Parece que no has realizado ninguna compra todavia. Explora nuestro catalogo.'}
            </p>
            {isFilterActive ? (
                <Button
                    onClick={onResetFilters}
                    className="px-8 rounded py-3 bg-[var(--color-amber-900)] text-white hover:bg-[var(--color-amber-900)]/90 normal-case font-bold"
                >
                    Limpiar Filtros
                </Button>
            ) : (
                <Link href="/catalog">
                    <Button className="px-8 rounded py-3 bg-[var(--color-amber-900)] text-white hover:bg-[var(--color-amber-900)]/90 normal-case font-bold">
                        Ver Catalogo
                    </Button>
                </Link>
            )}
        </div>
    );
}
