'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/input';
import { Label } from '../../src/components/ui/label';
import { toast } from 'sonner';
import { useUser } from '../../src/store/UserContext';
import Link from 'next/link';
import { Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const [step, setStep] = useState<'email' | 'password' | 'complete'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { register } = useUser();
    const router = useRouter();

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        const newErrors: Record<string, string> = {};

        if (!trimmedEmail) {
            newErrors.email = 'El correo electrónico es obligatorio';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmedEmail)) {
                newErrors.email = 'Formato de correo electrónico inválido';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setEmail(trimmedEmail);
        setStep('password');
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setStep('complete');
    };

    const handleCompleteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setErrors({ name: 'El nombre es obligatorio' });
            return;
        }

        setErrors({});
        const success = await register(email, password, name, phone);
        if (success) {
            router.push('/profile');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-sm border border-border">
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl font-black italic tracking-tighter mb-6 transform -skew-x-12 inline-block border-4 border-black dark:border-white px-2">
                        JP DK
                    </h1>
                    <h2 className="font-display text-2xl font-bold mb-2 tracking-tight">Crear cuenta</h2>
                    <p className="text-muted-foreground text-sm px-4">
                        {step === 'email' ? 'Ingresa tu correo para comenzar' :
                            step === 'password' ? 'Elige una contraseña segura' :
                                'Casi listo! Completa tus datos'}
                    </p>
                </div>

                <div className="space-y-6">
                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                                    Email <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                                        }}
                                        placeholder="ejemplo@correo.com"
                                        className={cn(
                                            "pl-10 h-12",
                                            errors.email && "ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive"
                                        )}
                                    />
                                </div>
                                {errors.email && <p className="text-destructive text-sm font-medium pl-1">{errors.email}</p>}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#78350f] hover:bg-[#451a03] text-white rounded font-bold normal-case text-lg py-6 shadow-lg transition-all active:scale-[0.98]"
                            >
                                Continuar
                            </Button>

                            <div className="text-center text-sm text-muted-foreground pt-2">
                                ¿Ya tienes cuenta?{' '}
                                <Link href="/login" className="text-[#92400e] hover:text-[#78350f] hover:underline font-bold transition-colors">
                                    Iniciar sesión
                                </Link>
                            </div>
                        </form>
                    ) : step === 'password' ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg border border-border/50">
                                <button
                                    onClick={() => setStep('email')}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-background rounded-md shadow-sm border border-transparent hover:border-border"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none">Tu Email</span>
                                    <span className="text-sm font-medium leading-tight">{email}</span>
                                </div>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-semibold">Contraseña <span className="text-red-500 ml-1">*</span></Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                                            }}
                                            placeholder="Mínimo 6 caracteres"
                                            className={cn(
                                                "pl-10 h-12",
                                                errors.password && "ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive"
                                            )}
                                            autoFocus
                                        />
                                    </div>
                                    {errors.password && <p className="text-destructive text-sm font-medium pl-1">{errors.password}</p>}
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Seguridad mínima requerida</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirmar Contraseña <span className="text-red-500 ml-1">*</span></Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                                            }}
                                            placeholder="Repite tu contraseña"
                                            className={cn(
                                                "pl-10 h-12",
                                                errors.confirmPassword && "ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive"
                                            )}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-destructive text-sm font-medium pl-1">{errors.confirmPassword}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#78350f] hover:bg-[#451a03] text-white rounded font-bold normal-case text-lg py-6 shadow-lg transition-all active:scale-[0.98]"
                                >
                                    Continuar
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg border border-border/50">
                                <button
                                    onClick={() => setStep('password')}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-background rounded-md shadow-sm border border-transparent hover:border-border"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none">Tu Email</span>
                                    <span className="text-sm font-medium leading-tight">{email}</span>
                                </div>
                            </div>

                            <form onSubmit={handleCompleteSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-semibold">Nombre Completo <span className="text-red-500 ml-1">*</span></Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => {
                                                setName(e.target.value);
                                                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                            }}
                                            placeholder="Juan Pérez"
                                            className={cn(
                                                "pl-10 h-12",
                                                errors.name && "ring-2 ring-destructive focus:ring-destructive bg-destructive/10 border-destructive"
                                            )}
                                            autoFocus
                                        />
                                    </div>
                                    {errors.name && <p className="text-destructive text-sm font-medium pl-1">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-semibold">Teléfono</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+56 9 1234 5678"
                                            className="pl-10 h-12"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold text-center">Opcional para contacto directo</p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#78350f] hover:bg-[#451a03] text-white rounded font-bold normal-case text-lg py-6 shadow-lg transition-all active:scale-[0.98]"
                                >
                                    Crear cuenta
                                </Button>

                                <p className="text-[11px] text-muted-foreground text-center px-4 leading-relaxed">
                                    Al crear una cuenta, aceptas nuestros{' '}
                                    <a href="#" className="text-[#92400e] hover:underline font-bold">Términos</a>
                                    {' '}y nuestra{' '}
                                    <a href="#" className="text-[#92400e] hover:underline font-bold">Privacidad</a>
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
