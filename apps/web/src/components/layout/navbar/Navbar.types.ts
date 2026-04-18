import { RefObject } from 'react';
import { User } from '@/types';

export interface NavbarMenuChild {
    label: string;
    path: string;
}

export interface NavbarMenuItem {
    id: string;
    type: 'link' | 'accordion';
    label: string;
    path?: string;
    isRed?: boolean;
    children?: NavbarMenuChild[];
}

export interface NavbarUserDropdownProps {
    dropdownRef: RefObject<HTMLDivElement | null>;
    isOpen: boolean;
    isAuthenticated: boolean;
    user: User | null;
    onToggle: () => void;
    onClose: () => void;
    onLogout: () => void;
}

export interface NavbarMobileMenuProps {
    isOpen: boolean;
    isCategoryOpen: boolean;
    menuItems: NavbarMenuItem[];
    isAuthenticated: boolean;
    user: User | null;
    onClose: () => void;
    onToggleCategory: () => void;
}
