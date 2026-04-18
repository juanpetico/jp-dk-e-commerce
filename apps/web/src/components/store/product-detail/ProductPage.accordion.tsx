'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItem {
    title: string;
    content: React.ReactNode;
}

function AccordionRow({ title, content }: AccordionItem) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 dark:border-zinc-800">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center py-4 text-sm font-bold uppercase tracking-wide text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
                {title}
                <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', open && 'rotate-180')} />
            </button>
            {open && (
                <div className="pb-4 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    {content}
                </div>
            )}
        </div>
    );
}

export default function ProductPageAccordion() {
    return (
        <div className="mt-8 border-t border-gray-200 dark:border-zinc-800">
            <AccordionRow
                title="Medidas"
                content={
                    <p className="text-gray-400 dark:text-zinc-600 italic">Tabla de medidas próximamente.</p>
                }
            />
            <AccordionRow
                title="Envíos"
                content={
                    <ul className="list-disc list-inside space-y-1">
                        <li>Despacho a todo Chile a través de Starken y Chilexpress.</li>
                        <li>Costo de envío calculado al momento del checkout.</li>
                        <li>Tiempo estimado de entrega: 3 a 7 días hábiles.</li>
                        <li>Retiro en tienda disponible coordinando por Instagram.</li>
                    </ul>
                }
            />
            <AccordionRow
                title="Devoluciones"
                content={
                    <ul className="list-disc list-inside space-y-1">
                        <li>Aceptamos cambios solo por fallas de fábrica.</li>
                        <li>El producto debe estar sin uso, con etiquetas y en su empaque original.</li>
                        <li>Plazo máximo para solicitar cambio: 7 días desde la recepción.</li>
                        <li>No realizamos devoluciones de dinero, solo cambio de producto.</li>
                    </ul>
                }
            />
        </div>
    );
}
