'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthStepIndicatorProps {
    steps: string[];
    current: number;
    connectorWidthClassName?: string;
}

export default function AuthStepIndicator({
    steps,
    current,
    connectorWidthClassName = 'w-10',
}: AuthStepIndicatorProps) {
    return (
        <div className="mb-6 flex items-center justify-center" aria-label={`Paso ${current} de ${steps.length}`}>
            {steps.map((label, idx) => {
                const stepNumber = idx + 1;
                const completed = stepNumber < current;
                const active = stepNumber === current;

                return (
                    <React.Fragment key={stepNumber}>
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-black transition-all duration-300',
                                    completed || active
                                        ? 'border-[#78350f] bg-[#78350f] text-white'
                                        : 'border-border bg-transparent text-muted-foreground'
                                )}
                            >
                                {completed ? <Check className="h-3.5 w-3.5" /> : stepNumber}
                            </div>
                            <span
                                className={cn(
                                    'text-[9px] font-bold uppercase tracking-widest',
                                    active ? 'text-[#78350f]' : 'text-muted-foreground'
                                )}
                            >
                                {label}
                            </span>
                        </div>

                        {idx < steps.length - 1 && (
                            <div
                                className={cn(
                                    'mx-1 mb-4 h-0.5 rounded-full transition-all duration-500',
                                    connectorWidthClassName,
                                    completed ? 'bg-[#78350f]' : 'bg-border'
                                )}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
