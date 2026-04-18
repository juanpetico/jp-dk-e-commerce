import { Product } from '@/types';
import { RefObject } from 'react';

export interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface SearchOverlayCategory {
    id: string;
    name: string;
    slug: string;
    isPublished?: boolean;
}

export interface SearchOverlayHeaderProps {
    searchTerm: string;
    inputRef: RefObject<HTMLInputElement | null>;
    onChangeSearchTerm: (value: string) => void;
    onClear: () => void;
    onInputBlur: () => void;
    onSubmitSearch: () => void;
    onClose: () => void;
}

export interface SearchOverlayResultsProps {
    searchTerm: string;
    isLoading: boolean;
    suggestions: SearchOverlayCategory[];
    products: Product[];
    onClose: () => void;
}

export interface SearchOverlayFooterProps {
    searchTerm: string;
    onClose: () => void;
}
