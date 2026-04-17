'use client';

import { FormEvent } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isValidEmail } from './login.validation';

interface LoginEmailStepProps {
    email: string;
    onEmailChange: (value: string) => void;
    onSubmit: (e: FormEvent) => void;
}

export default function LoginEmailStep({ email, onEmailChange, onSubmit }: LoginEmailStepProps) {
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
                        className="h-12 pl-10 focus-visible:ring-2 focus-visible:ring-[#78350f]"
                        autoComplete="email"
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full cursor-pointer rounded bg-[#78350f] py-6 text-lg font-bold normal-case text-white shadow-lg transition-all hover:bg-[#451a03] active:scale-[0.98]"
            >
                Continuar
            </Button>

            <div className="pt-2 text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="font-bold text-[#92400e] transition-colors hover:text-[#78350f] hover:underline">
                    Crear cuenta
                </Link>
            </div>
        </form>
    );
}
