'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/store/UserContext';
import AuthCard from '@/components/auth/shared/AuthCard';
import AuthStepIndicator from '@/components/auth/shared/AuthStepIndicator';
import LoginEmailStep from './LoginEmailStep';
import LoginPasswordStep from './LoginPasswordStep';
import { LoginStep } from './login.types';
import { resolvePostLoginRedirect } from '@/components/auth/navigation';

const LOGIN_STEPS = ['Email', 'Acceso'];

export default function LoginPageClient() {
    const [step, setStep] = useState<LoginStep>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    const redirectUrl = searchParams.get('redirect');
    const currentStepNumber = step === 'email' ? 1 : 2;

    const handleEmailSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (email) setStep('password');
    };

    const handlePasswordSubmit = async (event: FormEvent) => {
        event.preventDefault();

        try {
            const result = await login(email, password);
            if (!result.success) return;

            router.push(resolvePostLoginRedirect(redirectUrl, result.role));
        } catch (error) {
            console.error('Login submit error:', error);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center bg-background px-4">
            <AuthCard
                title="Iniciar sesión"
                subtitle={
                    step === 'email'
                        ? 'Inicia sesión o crea una cuenta'
                        : 'Ingresa tu contraseña para continuar'
                }
            >
                <AuthStepIndicator steps={LOGIN_STEPS} current={currentStepNumber} connectorWidthClassName="w-12" />

                <div className="space-y-6">
                    {step === 'email' ? (
                        <LoginEmailStep email={email} onEmailChange={setEmail} onSubmit={handleEmailSubmit} />
                    ) : (
                        <LoginPasswordStep
                            email={email}
                            password={password}
                            showPassword={showPassword}
                            onBack={() => setStep('email')}
                            onPasswordChange={setPassword}
                            onToggleShowPassword={() => setShowPassword((current) => !current)}
                            onSubmit={handlePasswordSubmit}
                        />
                    )}
                </div>
            </AuthCard>
        </div>
    );
}
