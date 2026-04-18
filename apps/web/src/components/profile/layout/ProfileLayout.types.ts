export interface ProfileNavigationItem {
    href: string;
    label: string;
}

export interface ProfileLayoutNavProps {
    isActivePath: (path: string) => boolean;
}

export interface ProfileLayoutUserMenuProps {
    isMenuOpen: boolean;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
    onLogout: () => void;
}
