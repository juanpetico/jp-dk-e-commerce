import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'font-display uppercase font-bold text-sm tracking-wider py-3 px-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-black text-white hover:bg-neutral-800 border border-black',
        outline: 'bg-transparent text-black border border-black hover:bg-black hover:text-white',
        ghost: 'bg-transparent text-black hover:bg-neutral-100',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
        <button
            className={cn(baseStyles, variants[variant], widthStyle, className)}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
