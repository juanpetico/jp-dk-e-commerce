'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, XCircle, Clock, Loader2 } from 'lucide-react';
import AuthCard from '@/components/auth/shared/AuthCard';
import PasswordStrength from '@/components/auth/register/PasswordStrength';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

type TokenState = 'loading' | 'valid' | 'expired' | 'invalid';

function TokenExpired() {
    return (
        <AuthCard title="Enlace expirado" subtitle="Este enlace de recuperación ya no es válido">
            <div className="space-y-6 text-center">
                <div className="flex justify-center">
                    <Clock className="h-16 w-16 text-amber-500" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Los enlaces de recuperación expiran a los <strong>15 minutos</strong> por seguridad.
                    </p>
                    <p className="text-sm text-muted-foreground">Solicita uno nuevo y úsalo de inmediato.</p>
                </div>
                <Link
                    href="/forgot-password"
                    className="inline-block w-full rounded bg-[#78350f] py-3 text-center text-sm font-bold text-white transition-all hover:bg-[#451a03]"
                >
                    Solicitar nuevo enlace
                </Link>
            </div>
        </AuthCard>
    );
}

function TokenInvalid() {
    return (
        <AuthCard title="Enlace inválido" subtitle="Este enlace no existe o ya fue utilizado">
            <div className="space-y-6 text-center">
                <div className="flex justify-center">
                    <XCircle className="h-16 w-16 text-red-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                    Si ya restableciste tu contraseña, puedes iniciar sesión directamente.
                </p>
                <div className="flex flex-col gap-2">
                    <Link
                        href="/login"
                        className="inline-block w-full rounded bg-[#78350f] py-3 text-center text-sm font-bold text-white transition-all hover:bg-[#451a03]"
                    >
                        Iniciar sesión
                    </Link>
                    <Link
                        href="/forgot-password"
                        className="inline-block w-full rounded border border-border py-3 text-center text-sm font-semibold transition-all hover:bg-muted"
                    >
                        Solicitar nuevo enlace
                    </Link>
                </div>
            </div>
        </AuthCard>
    );
}

function ResetForm({ token }: { token: string }) {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (password !== confirm) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 400) {
                    setError('El enlace expiró mientras completabas el formulario. Solicita uno nuevo.');
                } else {
                    setError(data.message || 'Ocurrió un error. Intenta nuevamente.');
                }
                return;
            }

            toast.success('Contraseña actualizada. Ya puedes iniciar sesión.');
            router.push('/login');
        } catch {
            setError('No se pudo conectar con el servidor. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard title="Nueva contraseña" subtitle="Elige una contraseña segura para tu cuenta">
            <form onSubmit={handleSubmit} className="animate-fade-in space-y-5">
                <div className="space-y-2">
                    <Label
                        htmlFor="password"
                        className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                        Nueva contraseña <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                            className="h-12 pl-10 pr-11 focus-visible:ring-2 focus-visible:ring-[#78350f]"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <PasswordStrength password={password} />
                </div>

                <div className="space-y-2">
                    <Label
                        htmlFor="confirm"
                        className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                        Confirmar contraseña <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="confirm"
                            type={showConfirm ? 'text' : 'password'}
                            required
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="Repite tu contraseña"
                            className="h-12 pl-10 pr-11 focus-visible:ring-2 focus-visible:ring-[#78350f]"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 px-3 py-2 dark:bg-red-950/30">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        {error.includes('expiró') && (
                            <Link href="/forgot-password" className="mt-1 inline-block text-sm font-semibold text-[#78350f] hover:underline">
                                Solicitar nuevo enlace →
                            </Link>
                        )}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full cursor-pointer rounded bg-[#78350f] py-6 text-lg font-bold normal-case text-white shadow-lg transition-all hover:bg-[#451a03] active:scale-[0.98] disabled:opacity-60"
                >
                    {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                </Button>
            </form>
        </AuthCard>
    );
}

export default function ResetPasswordPageClient() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [tokenState, setTokenState] = useState<TokenState>('loading');

    useEffect(() => {
        if (!token || token.length !== 64) {
            setTokenState('invalid');
            return;
        }

        fetch(`${API_URL}/auth/validate-reset-token?token=${token}`)
            .then((res) => res.json())
            .then((data: { valid: boolean; reason?: string }) => {
                if (data.valid) {
                    setTokenState('valid');
                } else if (data.reason === 'expired') {
                    setTokenState('expired');
                } else {
                    setTokenState('invalid');
                }
            })
            .catch(() => setTokenState('invalid'));
    }, [token]);

    if (tokenState === 'loading') {
        return (
            <div className="flex min-h-[80vh] items-center justify-center bg-background px-4">
                <AuthCard title="Verificando enlace..." subtitle="Espera un momento">
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-10 w-10 animate-spin text-[#78350f]" />
                    </div>
                </AuthCard>
            </div>
        );
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center bg-background px-4">
            {tokenState === 'valid' && token && <ResetForm token={token} />}
            {tokenState === 'expired' && <TokenExpired />}
            {tokenState === 'invalid' && <TokenInvalid />}
        </div>
    );
}
