'use client';

import { FormEvent } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import EmailChip from '@/components/auth/shared/EmailChip';
import PasswordStrength from './PasswordStrength';
import { RegisterErrors } from './register.types';

interface RegisterPasswordStepProps {
    email: string;
    password: string;
    confirmPassword: string;
    showPassword: boolean;
    showConfirm: boolean;
    errors: RegisterErrors;
    onBack: () => void;
    onPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
    onTogglePassword: () => void;
    onToggleConfirm: () => void;
    onSubmit: (e: FormEvent) => void;
}

export default function RegisterPasswordStep({
    email,
    password,
    confirmPassword,
    showPassword,
    showConfirm,
    errors,
    onBack,
    onPasswordChange,
    onConfirmPasswordChange,
    onTogglePassword,
    onToggleConfirm,
    onSubmit,
}: RegisterPasswordStepProps) {
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
                            value={password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                            placeholder="Minimo 6 caracteres"
                            className={cn(
                                'h-12 pl-10 pr-11 focus-visible:ring-2 focus-visible:ring-[#78350f]',
                                errors.password &&
                                    'border-destructive bg-destructive/10 ring-2 ring-destructive focus-visible:ring-destructive'
                            )}
                            autoFocus
                            autoComplete="new-password"
                        />

                        <button
                            type="button"
                            onClick={onTogglePassword}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    {errors.password && (
                        <p className="pl-1 text-sm font-medium text-destructive" role="alert">
                            {errors.password}
                        </p>
                    )}

                    <PasswordStrength password={password} />
                </div>

                <div className="space-y-2">
                    <Label
                        htmlFor="confirmPassword"
                        className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                        Confirmar contraseña <span className="text-red-500">*</span>
                    </Label>

                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="confirmPassword"
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => onConfirmPasswordChange(e.target.value)}
                            placeholder="Repite tu contraseña"
                            className={cn(
                                'h-12 pl-10 pr-11 focus-visible:ring-2 focus-visible:ring-[#78350f]',
                                errors.confirmPassword &&
                                    'border-destructive bg-destructive/10 ring-2 ring-destructive focus-visible:ring-destructive'
                            )}
                            autoComplete="new-password"
                        />

                        <button
                            type="button"
                            onClick={onToggleConfirm}
                            aria-label={showConfirm ? 'Ocultar confirmacion' : 'Mostrar confirmacion'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    {errors.confirmPassword && (
                        <p className="pl-1 text-sm font-medium text-destructive" role="alert">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full cursor-pointer rounded bg-[#78350f] py-6 text-lg font-bold normal-case text-white shadow-lg transition-all hover:bg-[#451a03] active:scale-[0.98]"
                >
                    Continuar
                </Button>
            </form>
        </div>
    );
}
