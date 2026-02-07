import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const Hero: React.FC = () => {
    return (
        <div className="relative w-full h-[600px] bg-black overflow-hidden group">
            <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_FNH6tNtx5xuVkybd_qvjNMCEsoplU1Tm3yOVmRYnYH2uhOAP5snypXPdAksK0RhkudSRR2MRXY0Ie3ndiu25lQwytLfiFSvN4JNm8fGpUqs2cDo8H23zHV_SEtRSNOCq98Iy5VKsRocVpfg6w3g1sKOfL7vMy0uKhOLEBDmEvtWaNyFJVH2m_Z9PQriAtyOlshmbK6W7sVKVynWfbj-hX6Mll8OyS4dGTQ1tnqdbpqf5N57_LiROge-PK19qLzxUFWQYn6ckzk4"
                alt="Streetwear model"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-yellow-400 font-display font-bold tracking-wider uppercase text-lg md:text-xl mb-2 animate-pulse">
                    Tu Verano con las mejores prendas
                </h2>
                <h1 className="text-white font-display font-black text-6xl md:text-8xl tracking-tighter uppercase mb-6 drop-shadow-lg" style={{ textShadow: '4px 4px 0px rgba(255,0,255,0.5)' }}>
                    JP DK GANG
                </h1>

                <div className="bg-black/80 backdrop-blur-md border border-white/20 p-6 max-w-2xl transform -skew-x-2">
                    <p className="text-white font-display text-2xl md:text-3xl uppercase font-bold leading-tight transform skew-x-2">
                        COMPRA 1 + 1 <span className="text-yellow-400">QUEDA CON 25% OFF</span><br />
                        COMPRA 2 + 1 <span className="text-yellow-400">QUEDA CON 45% OFF</span>
                    </p>
                    <div className="transform skew-x-2 mt-6">
                        <Link href="/catalog">
                            <Button className="bg-white text-black hover:bg-gray-200 border-none font-black text-lg px-8 py-3">
                                Ver Colección
                            </Button>
                        </Link>
                    </div>
                </div>
                <p className="mt-8 text-yellow-400 font-bold uppercase tracking-widest text-sm">Compras sobre $50.000 llevan regalo + envío gratis</p>
            </div>
        </div>
    );
};
