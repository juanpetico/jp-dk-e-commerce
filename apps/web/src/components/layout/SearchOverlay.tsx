'use client';

import SearchOverlayClient from './search-overlay/SearchOverlayClient';
import { SearchOverlayProps } from './search-overlay/SearchOverlay.types';

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    return <SearchOverlayClient isOpen={isOpen} onClose={onClose} />;
}
