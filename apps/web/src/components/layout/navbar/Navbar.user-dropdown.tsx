import Link from 'next/link';
import { LogIn, LogOut, MonitorCog, Package, Settings, User, UserPlus } from 'lucide-react';
import { NavbarUserDropdownProps } from './Navbar.types';

export default function NavbarUserDropdown({
    dropdownRef,
    isOpen,
    isAuthenticated,
    user,
    onToggle,
    onClose,
    onLogout,
}: NavbarUserDropdownProps) {
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={onToggle}
                className="flex items-center gap-1 text-foreground hover:text-muted-foreground p-2 transition-colors"
            >
                <User className="w-6 h-6" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-popover text-popover-foreground rounded-lg shadow-xl border border-border py-2 z-[60] animate-fade-in">
                    {isAuthenticated && user ? (
                        <>
                            <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="py-1">
                                {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                                    <Link
                                        href={user.role === 'SUPERADMIN' ? '/superadmin/dashboard' : '/admin/dashboard'}
                                        onClick={onClose}
                                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors"
                                    >
                                        <MonitorCog className="w-4 h-4 text-muted-foreground" />
                                        Panel
                                    </Link>
                                )}
                                <Link
                                    href="/profile"
                                    onClick={onClose}
                                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors"
                                >
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    Perfil
                                </Link>

                                <Link
                                    href="/orders"
                                    onClick={onClose}
                                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors"
                                >
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                    Pedidos
                                </Link>

                                <Link
                                    href={user.role === 'SUPERADMIN' ? '/superadmin/settings' : '/profile'}
                                    onClick={onClose}
                                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-muted-foreground" />
                                    Configuracion
                                </Link>
                            </div>
                            <div className="border-t border-border pt-1">
                                <button
                                    onClick={onLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-muted/50 flex items-center gap-3 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar sesion
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="py-1">
                            <Link
                                href="/login"
                                onClick={onClose}
                                className="px-4 py-2 text-sm text-foreground hover:bg-muted/50 font-bold flex items-center gap-3 transition-colors"
                            >
                                <LogIn className="w-4 h-4 text-muted-foreground" />
                                Iniciar sesion
                            </Link>
                            <Link
                                href="/login"
                                onClick={onClose}
                                className="px-4 py-2 text-sm text-foreground hover:text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors"
                            >
                                <UserPlus className="w-4 h-4 text-muted-foreground" />
                                Crear cuenta
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
