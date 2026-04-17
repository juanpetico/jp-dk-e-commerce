import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SearchOverlayFooterProps } from './SearchOverlay.types';

export default function SearchOverlayFooter({ searchTerm, onClose }: SearchOverlayFooterProps) {
    if (searchTerm.length === 0) {
        return null;
    }

    return (
        <div className="border-t border-border bg-muted/50 p-4">
            <div className="max-w-4xl mx-auto w-full">
                <Link
                    href={`/catalog?search=${encodeURIComponent(searchTerm)}`}
                    onClick={onClose}
                    className="flex items-center justify-between text-foreground font-bold uppercase tracking-wider text-sm hover:text-muted-foreground transition-colors"
                >
                    <span>Buscar "{searchTerm}"</span>
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
