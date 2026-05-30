import { Button } from '@/components/ui/Button';

interface CatalogPageEmptyProps {
    onReset: () => void;
}

export default function CatalogPageEmpty({ onReset }: CatalogPageEmptyProps) {
    return (
        <div className="text-center py-20 bg-muted/40 rounded-lg border border-dashed border-border">
            <p className="text-muted-foreground font-display text-xl uppercase tracking-wide">Sin productos disponibles</p>
            <Button
                variant="outline"
                className="mt-4 border-border text-foreground hover:bg-foreground hover:text-background"
                onClick={onReset}
            >
                Ver todo el catálogo
            </Button>
        </div>
    );
}
