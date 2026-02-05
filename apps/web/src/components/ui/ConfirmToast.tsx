'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmToastProps {
    message: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmToast: React.FC<ConfirmToastProps> = ({
    message,
    description,
    onConfirm,
    onCancel,
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevenir scroll cuando el modal está abierto
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-end justify-center p-6 md:pb-12 pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] pointer-events-auto animate-fade-in"
                onClick={onCancel}
            />

            {/* Alert Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] p-8 w-full max-w-sm pointer-events-auto animate-slide-up relative z-10">
                <div className="flex flex-col gap-2 mb-8 text-center sm:text-left">
                    <h3 className="text-black dark:text-white font-bold text-lg tracking-tight leading-tight">
                        {message}
                    </h3>
                    {description && (
                        <p className="text-gray-500 dark:text-neutral-400 text-sm leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white text-sm font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-6 py-4 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-2xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-lg shadow-black/10 dark:shadow-none active:scale-95"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmToast;
