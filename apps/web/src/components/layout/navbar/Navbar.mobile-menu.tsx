import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { NavbarMobileMenuProps } from './Navbar.types';

export default function NavbarMobileMenu({
    isOpen,
    isCategoryOpen,
    menuItems,
    isAuthenticated,
    user,
    onClose,
    onToggleCategory,
}: NavbarMobileMenuProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="absolute top-full left-0 w-full h-[calc(100vh-100%)] bg-background border-t border-border animate-slide-in z-20 flex flex-col shadow-2xl">
            <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col items-center justify-center space-y-6">
                <Link
                    href="/"
                    onClick={onClose}
                    className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-foreground hover:text-muted-foreground hover:scale-105 transition-all"
                >
                    Inicio
                </Link>

                {menuItems.map((item) => {
                    if (item.type === 'link') {
                        return (
                            <Link
                                key={item.id}
                                href={item.path || '#'}
                                onClick={onClose}
                                className={`text-3xl md:text-5xl font-display font-black uppercase tracking-tight hover:scale-105 transition-all ${
                                    item.isRed ? 'text-red-600 hover:text-red-500' : 'text-foreground hover:text-muted-foreground'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    }

                    return (
                        <div key={item.id} className="flex flex-col items-center w-full">
                            <button
                                onClick={onToggleCategory}
                                className="flex items-center justify-center gap-2 text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-foreground hover:text-muted-foreground hover:scale-105 transition-all focus:outline-none"
                            >
                                {item.label}
                                <ChevronDown
                                    className={`w-8 h-8 md:w-12 md:h-12 transition-transform duration-300 ${
                                        isCategoryOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col items-center space-y-4 ${
                                    isCategoryOpen ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'
                                }`}
                            >
                                {item.children?.map((child) => (
                                    <Link
                                        key={child.label}
                                        href={child.path}
                                        onClick={onClose}
                                        className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {child.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div className="w-24 h-px bg-border my-4" />

                {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                    <Link
                        href={user.role === 'ADMIN' ? '/admin' : '/superadmin'}
                        onClick={onClose}
                        className="text-sm font-display font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Admin Panel
                    </Link>
                )}

                {!isAuthenticated && (
                    <Link
                        href="/login"
                        onClick={onClose}
                        className="text-sm font-display font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Iniciar Sesion
                    </Link>
                )}
            </div>
        </div>
    );
}
