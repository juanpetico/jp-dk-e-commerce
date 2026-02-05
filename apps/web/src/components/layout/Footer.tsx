"use client";

import React from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@repo/ui';

const Footer: React.FC = () => {
    const pathname = usePathname();
    const isProfileRoute = ['/profile', '/orders', '/settings'].some(route => pathname?.startsWith(route));

    if (isProfileRoute) return null;

    return (
        <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="block mb-6 relative h-12 w-32">
                            <span className="sr-only">JP DK</span>
                            <NextImage
                                src="/logo.png"
                                alt="JP DK Logo"
                                fill
                                className="object-contain dark:invert"
                            />
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Es Calle. Moda urbana con carácter. Diseñado para destacar en la jungla de concreto.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">IG</a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">FB</a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">TK</a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-bold uppercase tracking-wider mb-6 text-sm text-gray-200">Navegación</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
                            <li><Link href="/catalog" className="hover:text-white transition-colors">Catálogo</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Lookbook</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold uppercase tracking-wider mb-6 text-sm text-gray-200">Soporte</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-white transition-colors">Cambios y Devoluciones</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Tiempos de Despacho</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="bg-neutral-900 p-6 rounded border border-gray-800">
                        <h4 className="font-bold uppercase tracking-wider mb-2 text-white">Únete al GANG</h4>
                        <p className="text-xs text-gray-400 mb-4">Recibe drops exclusivos y 10% OFF en tu primera compra.</p>
                        <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Tu correo electrónico"
                                className="bg-black border border-gray-700 text-white px-4 py-2 text-sm focus:outline-none focus:border-white placeholder-gray-500 w-full"
                            />
                            <Button type="submit" className="bg-white text-black hover:bg-gray-200 border-none w-full">Suscribirse</Button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>© 2024 JP DK Brand. Todos los derechos reservados.</p>
                    <div className="mt-4 md:mt-0 flex space-x-2">
                        <span>Powered by JP DK</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
