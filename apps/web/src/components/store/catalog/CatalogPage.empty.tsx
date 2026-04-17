import { Button } from '@/components/ui/Button';

interface CatalogPageEmptyProps {
    onReset: () => void;
}

export default function CatalogPageEmpty({ onReset }: CatalogPageEmptyProps) {
    return (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-400 font-display text-xl uppercase tracking-wide">Sin stock disponible</p>
            <Button variant="outline" className="mt-4" onClick={onReset}>
                Ver todo el catalogo
            </Button>
        </div>
    );
}
