import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const Hero: React.FC = () => {
    return (
        <section className="hero-banner" aria-label="Hero principal">
            <video className="hero-video" autoPlay muted loop playsInline>
                <source src="/hero.mp4" type="video/mp4" />
            </video>

            <div className="hero-overlay" />

            <div className="hero-content">
                <p className="text-yellow-300 font-display font-bold tracking-[0.28em] uppercase text-xs md:text-sm mb-3 text-center">
                    Tu verano con las mejores prendas
                </p>
                <h1 className="text-white font-display font-black text-6xl md:text-8xl tracking-tighter uppercase mb-6 drop-shadow-lg text-center">
                    JP DK GANG
                </h1>

                <div className="hero-glass-panel px-5 py-4 md:px-8 md:py-6 max-w-2xl w-full mx-auto text-center">
                    <p className="text-white font-display text-xl md:text-3xl uppercase font-black leading-tight">
                        Compra 1 + 1 <span className="text-yellow-300">queda con 25% off</span>
                    </p>
                    <p className="text-white font-display text-xl md:text-3xl uppercase font-black leading-tight mt-1">
                        Compra 2 + 1 <span className="text-yellow-300">queda con 45% off</span>
                    </p>

                    <div className="mt-6">
                        <Link href="/catalog">
                            <Button className="bg-white text-black hover:bg-gray-200 border-none font-black text-lg px-8 py-3">
                                Ver Colección
                            </Button>
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-white/90 font-semibold uppercase tracking-[0.14em] text-[11px] md:text-xs text-center">
                    Nuevo drop disponible
                </p>
            </div>
        </section>
    );
};
