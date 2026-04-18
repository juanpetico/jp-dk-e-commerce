import { CouponsPageHeaderProps } from './CouponsPage.types';

export default function CouponsPageHeader({ totalCoupons }: CouponsPageHeaderProps) {
    return (
        <header className="mb-10">
            <h1 className="font-display text-3xl font-bold mb-2 text-foreground">Mis Descuentos</h1>
            <p className="text-muted-foreground">
                Aqui encontraras todos tus beneficios y cupones exclusivos.
                {totalCoupons > 0 ? ` (${totalCoupons})` : ''}
            </p>
        </header>
    );
}
