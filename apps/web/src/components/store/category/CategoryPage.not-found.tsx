import Link from 'next/link';
import { Button } from '@repo/ui';

export default function CategoryPageNotFound() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h1 className="text-4xl font-display font-black uppercase mb-4">Categoria no encontrada</h1>
            <Link href="/catalog">
                <Button variant="outline">Volver al catalogo</Button>
            </Link>
        </div>
    );
}
