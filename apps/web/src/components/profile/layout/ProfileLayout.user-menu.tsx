import { ChevronDown, LogOut, User } from 'lucide-react';
import { ProfileLayoutUserMenuProps } from './ProfileLayout.types';

export default function ProfileLayoutUserMenu({
    isMenuOpen,
    onToggleMenu,
    onCloseMenu,
    onLogout,
}: ProfileLayoutUserMenuProps) {
    return (
        <div className="relative">
            <button
                onClick={onToggleMenu}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
                <div className="w-8 h-8 rounded-full border border-input flex items-center justify-center">
                    <User className="w-5 h-5" />
                </div>
                <ChevronDown className="w-4 h-4" />
            </button>

            {isMenuOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={onCloseMenu} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-20 py-1">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-amber-900)] hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesion
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
