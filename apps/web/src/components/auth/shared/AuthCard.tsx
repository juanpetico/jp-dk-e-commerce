'use client';

import { ReactNode } from 'react';

interface AuthCardProps {
    title: string;
    subtitle: string;
    children: ReactNode;
    subtitleClassName?: string;
}

export default function AuthCard({ title, subtitle, children, subtitleClassName = '' }: AuthCardProps) {
    return (
        <div className="max-w-md w-full rounded-lg border border-border bg-card p-8 shadow-md transition-all duration-300 hover:border-[#78350f]/30 hover:shadow-xl">
            <div className="mb-6 text-center">
                <h1 className="font-display mb-4 inline-block -skew-x-12 transform border-4 border-black px-2 text-4xl font-black italic tracking-tighter dark:border-white">
                    JP DK
                </h1>
                <h2 className="font-display mb-1 text-2xl font-bold tracking-tight">{title}</h2>
                <p className={`text-sm text-muted-foreground ${subtitleClassName}`}>{subtitle}</p>
            </div>

            {children}
        </div>
    );
}
