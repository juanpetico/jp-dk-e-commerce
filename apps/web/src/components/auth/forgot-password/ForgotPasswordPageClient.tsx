'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import AuthCard from '@/components/auth/shared/AuthCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function ForgotPasswordPageClient() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                toast.error((data as any).message || 'Ocurrió un error. Intenta nuevamente.');
                return;
            }

            setSent(true);
        } catch {
            toast.error('No se pudo conectar con el servidor. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center bg-background px-4">
            <AuthCard
                title="Recuperar contraseña"
                subtitle={sent ? 'Revisa tu correo electrónico' : 'Te enviaremos un enlace para restablecer tu clave'}
            >
                {sent ? (
                    <div className="animate-fade-in space-y-6 text-center">
                        <div className="flex justify-center">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Si <span className="font-semibold text-foreground">{email}</span> está registrado,
                                recibirás un correo con el enlace en los próximos minutos.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                El enlace expira en 15 minutos. Revisa también tu carpeta de spam.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Volver al inicio de sesión
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="animate-fade-in space-y-5">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
                            >
                                Correo electrónico <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@correo.cl"
                                    className="h-12 pl-10 focus-visible:ring-2 focus-visible:ring-[#78350f]"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full cursor-pointer rounded bg-[#78350f] py-6 text-lg font-bold normal-case text-white shadow-lg transition-all hover:bg-[#451a03] active:scale-[0.98] disabled:opacity-60"
                        >
                            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </Button>

                        <div className="pt-1 text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </form>
                )}
            </AuthCard>
        </div>
    );
}
