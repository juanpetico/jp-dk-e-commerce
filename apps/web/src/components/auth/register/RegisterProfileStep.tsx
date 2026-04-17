'use client';

import { FormEvent } from 'react';
import { Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import EmailChip from '@/components/auth/shared/EmailChip';
import { RegisterErrors } from './register.types';

interface RegisterProfileStepProps {
    email: string;
    name: string;
    phone: string;
    errors: RegisterErrors;
    onBack: () => void;
    onNameChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onSubmit: (e: FormEvent) => void;
}

export default function RegisterProfileStep({
    email,
    name,
    phone,
    errors,
    onBack,
    onNameChange,
    onPhoneChange,
    onSubmit,
}: RegisterProfileStepProps) {
    return (
        <div className="animate-fade-in space-y-5">
            <EmailChip email={email} onBack={onBack} />

            <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label
                        htmlFor="name"
                        className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                        Nombre completo <span className="text-red-500">*</span>
                    </Label>

                    <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            placeholder="Juan Perez"
                            className={cn(
                                'h-12 pl-10 focus-visible:ring-2 focus-visible:ring-[#78350f]',
                                errors.name &&
                                    'border-destructive bg-destructive/10 ring-2 ring-destructive focus-visible:ring-destructive'
                            )}
                            autoFocus
                            autoComplete="name"
                        />
                    </div>

                    {errors.name && (
                        <p className="pl-1 text-sm font-medium text-destructive" role="alert">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label
                        htmlFor="phone"
                        className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                        Telefono
                        <span className="ml-1 text-[10px] font-normal normal-case tracking-normal text-muted-foreground/60">
                            (opcional)
                        </span>
                    </Label>

                    <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => onPhoneChange(e.target.value)}
                            placeholder="+56 9 1234 5678"
                            className="h-12 pl-10 focus-visible:ring-2 focus-visible:ring-[#78350f]"
                            autoComplete="tel"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full cursor-pointer rounded bg-[#78350f] py-6 text-lg font-bold normal-case text-white shadow-lg transition-all hover:bg-[#451a03] active:scale-[0.98]"
                >
                    Crear cuenta
                </Button>

                <p className="px-4 text-center text-[11px] leading-relaxed text-muted-foreground">
                    Al crear una cuenta, aceptas nuestros{' '}
                    <a href="#" className="font-bold text-[#92400e] hover:underline">
                        Terminos
                    </a>{' '}
                    y nuestra{' '}
                    <a href="#" className="font-bold text-[#92400e] hover:underline">
                        Privacidad
                    </a>
                </p>
            </form>
        </div>
    );
}
