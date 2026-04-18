'use client';

interface PasswordStrengthProps {
    password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
    if (!password) return null;

    const len = password.length;
    const level = len < 6 ? 'weak' : len < 10 ? 'medium' : 'strong';
    const config = {
        weak: { width: 'w-1/3', color: 'bg-red-500', label: 'Debil' },
        medium: { width: 'w-2/3', color: 'bg-yellow-500', label: 'Media' },
        strong: { width: 'w-full', color: 'bg-green-500', label: 'Fuerte' },
    }[level];

    return (
        <div className="space-y-1">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full transition-all duration-500 ${config.width} ${config.color}`} />
            </div>
            <p
                className={`text-[10px] font-bold uppercase tracking-widest ${
                    level === 'weak' ? 'text-red-500' : level === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }`}
            >
                Seguridad: {config.label}
            </p>
        </div>
    );
}
