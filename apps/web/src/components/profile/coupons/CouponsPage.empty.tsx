import { Ticket } from 'lucide-react';
import { CouponsPageEmptyProps } from './CouponsPage.types';

export default function CouponsPageEmpty({ hasError }: CouponsPageEmptyProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed border-border rounded-2xl">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Ticket className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">{hasError ? 'No pudimos cargar tus cupones' : 'No tienes cupones activos'}</h3>
            <p className="text-muted-foreground text-center max-w-sm">
                {hasError
                    ? 'Intenta nuevamente en unos minutos.'
                    : 'Sigue comprando para desbloquear beneficios exclusivos y cupones de regalo.'}
            </p>
        </div>
    );
}
