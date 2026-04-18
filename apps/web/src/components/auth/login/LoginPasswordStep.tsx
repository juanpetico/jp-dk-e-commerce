'use client';

import { FormEvent } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmailChip from '@/components/auth/shared/EmailChip';

interface LoginPasswordStepProps {
    email: string;
    password: string;
    showPassword: boolean;
    loginFailed: boolean;
    onBack: () => void;
    onPasswordChange: (value: string) => void;
    onToggleShowPassword: () => void;
    onSubmit: (e: FormEvent) => void;
}

export default function LoginPasswordStep({
    email,
    password,
    showPassword,
    loginFailed,
    onBack,
    onPasswordChange,
    onToggleShowPassword,
    onSubmit,
}: LoginPasswordStepProps) {
    return (
        <div className="animate-fade-in space-y-5">
            <EmailChip email={email} onBack={onBack} />

            <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label
                        htmlFor="password"
                        className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                        Contraseña <span className="text-red-500">*</span>
                    </Label>

                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                            placeholder="••••••••"
                            className={`h-12 pl-10 pr-11 focus-visible:ring-2 focus-visible:ring-[#78350f] ${loginFailed ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                            autoFocus
                            autoComplete="current-password"
                        />

                        <button
                            type="button"
                            onClick={onToggleShowPassword}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {loginFailed && (
                    <div className="animate-fade-in rounded-md border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/30">
                        <p className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-300">
                            Contraseña incorrecta.
                        </p>
                        <Link
                            href="/forgot-password"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-[#78350f] underline-offset-2 transition-colors hover:underline dark:text-amber-400"
                        >
                            ¿Olvidaste tu contraseña? → Recuperar acceso
                        </Link>
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full cursor-pointer rounded bg-[#78350f] py-6 text-lg font-bold normal-case text-white shadow-lg transition-all hover:bg-[#451a03] active:scale-[0.98]"
                >
                    Iniciar Sesión
                </Button>

                {!loginFailed && (
                    <div className="pt-2 text-center">
                        <Link href="/forgot-password" className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                )}
            </form>
        </div>
    );
}
