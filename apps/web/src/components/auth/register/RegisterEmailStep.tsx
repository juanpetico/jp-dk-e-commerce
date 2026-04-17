'use client';

import { FormEvent } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { RegisterErrors } from './register.types';

interface RegisterEmailStepProps {
    email: string;
    errors: RegisterErrors;
    onEmailChange: (value: string) => void;
    onSubmit: (e: FormEvent) => void;
}

export default function RegisterEmailStep({ email, errors, onEmailChange, onSubmit }: RegisterEmailStepProps) {
    return (
        <form onSubmit={onSubmit} className="animate-fade-in space-y-5">
            <div className="space-y-2">
                <Label
                    htmlFor="email"
                    className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
                >
                    Email <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className={cn(
                            'h-12 pl-10 focus-visible:ring-2 focus-visible:ring-[#78350f]',
                            errors.email &&
                                'border-destructive bg-destructive/10 ring-2 ring-destructive focus-visible:ring-destructive'
                        )}
                        autoComplete="email"
                    />
                </div>

                {errors.email && (
                    <p className="pl-1 text-sm font-medium text-destructive" role="alert">
                        {errors.email}
                    </p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full cursor-pointer rounded bg-[#78350f] py-6 text-lg font-bold normal-case text-white shadow-lg transition-all hover:bg-[#451a03] active:scale-[0.98]"
            >
                Continuar
            </Button>

            <div className="pt-2 text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="font-bold text-[#92400e] transition-colors hover:text-[#78350f] hover:underline">
                    Iniciar sesion
                </Link>
            </div>
        </form>
    );
}
