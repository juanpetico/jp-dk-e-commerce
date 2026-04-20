'use client';

import SearchOverlayClient from './search-overlay/SearchOverlayClient';
import { SearchOverlayProps } from './search-overlay/SearchOverlay.types';

export default function SearchOverlay({ isOpen, onClose, variant = 'fullscreen', isNavTransparent = false }: SearchOverlayProps) {
    return <SearchOverlayClient isOpen={isOpen} onClose={onClose} variant={variant} isNavTransparent={isNavTransparent} />;
}
