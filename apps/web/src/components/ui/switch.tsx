import * as React from 'react';
import { cn } from '@/lib/utils';

type SwitchProps = {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
};

export function Switch({ checked, onCheckedChange, disabled = false, className, ...props }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                checked ? 'bg-primary' : 'bg-muted',
                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                className
            )}
            {...props}
        >
            <span
                className={cn(
                    'inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform',
                    checked ? 'translate-x-5' : 'translate-x-1'
                )}
            />
        </button>
    );
}
