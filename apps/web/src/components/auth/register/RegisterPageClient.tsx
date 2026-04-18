'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/store/UserContext';
import { fetchCheckEmailAvailability } from '@/store/user-context/UserContext.api';
import { LoyaltyModal } from '@/components/ui/LoyaltyModal';
import AuthCard from '@/components/auth/shared/AuthCard';
import AuthStepIndicator from '@/components/auth/shared/AuthStepIndicator';
import RegisterEmailStep from './RegisterEmailStep';
import RegisterPasswordStep from './RegisterPasswordStep';
import RegisterProfileStep from './RegisterProfileStep';
import { RegisterErrors, RegisterStep } from './register.types';
import { validateEmailStep, validatePasswordStep, validateProfileStep } from './register.validation';

const REGISTER_STEPS = ['Email', 'Contraseña', 'Perfil'];

export default function RegisterPageClient() {
    const [step, setStep] = useState<RegisterStep>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState<RegisterErrors>({});
    const [showLoyalty, setShowLoyalty] = useState(false);
    const [couponInfo, setCouponInfo] = useState<{ code: string; message: string } | null>(null);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    const { register } = useUser();
    const router = useRouter();

    const currentStepNumber = step === 'email' ? 1 : step === 'password' ? 2 : 3;

    const clearFieldError = (field: string) => {
        if (!errors[field]) return;
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleEmailSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const nextErrors = validateEmailStep(email);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        try {
            setIsCheckingEmail(true);
            const response = await fetchCheckEmailAvailability(email);
            const data = await response.json();

            if (!response.ok) {
                setErrors({ email: data.message || 'No se pudo verificar el correo' });
                return;
            }

            if (!data?.data?.available) {
                setErrors({ email: 'Este correo ya esta registrado' });
                return;
            }
        } catch {
            setErrors({ email: 'No se pudo verificar el correo' });
            return;
        } finally {
            setIsCheckingEmail(false);
        }

        setErrors({});
        setEmail(email.trim());
        setStep('password');
    };

    const handlePasswordSubmit = (event: FormEvent) => {
        event.preventDefault();

        const nextErrors = validatePasswordStep(password, confirmPassword);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        setErrors({});
        setStep('complete');
    };

    const handleCompleteSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const nextErrors = validateProfileStep(name, phone);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        setErrors({});
        const result = await register(email, password, name, phone);

        if (!result.success) return;

        if (result.welcomeCoupon) {
            setCouponInfo(result.welcomeCoupon);
            setShowLoyalty(true);
            return;
        }

        router.push('/profile');
    };

    const handleLoyaltyClose = () => {
        setShowLoyalty(false);
        router.push('/profile');
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center bg-background px-4">
            <LoyaltyModal
                isOpen={showLoyalty}
                onClose={handleLoyaltyClose}
                type="WELCOME"
                couponCode={couponInfo?.code || ''}
                message={couponInfo?.message}
            />

            <AuthCard
                title="Crear cuenta"
                subtitle={
                    step === 'email'
                        ? 'Ingresa tu correo para comenzar'
                        : step === 'password'
                          ? 'Elige una contraseña segura'
                          : '¡Casi listo! Completa tus datos'
                }
                subtitleClassName="px-4"
            >
                <AuthStepIndicator steps={REGISTER_STEPS} current={currentStepNumber} connectorWidthClassName="w-10" />

                <div className="space-y-6">
                    {step === 'email' && (
                        <RegisterEmailStep
                            email={email}
                            errors={errors}
                            onEmailChange={(value) => {
                                setEmail(value);
                                clearFieldError('email');
                            }}
                            isSubmitting={isCheckingEmail}
                            onSubmit={handleEmailSubmit}
                        />
                    )}

                    {step === 'password' && (
                        <RegisterPasswordStep
                            email={email}
                            password={password}
                            confirmPassword={confirmPassword}
                            showPassword={showPassword}
                            showConfirm={showConfirm}
                            errors={errors}
                            onBack={() => setStep('email')}
                            onPasswordChange={(value) => {
                                setPassword(value);
                                clearFieldError('password');
                            }}
                            onConfirmPasswordChange={(value) => {
                                setConfirmPassword(value);
                                clearFieldError('confirmPassword');
                            }}
                            onTogglePassword={() => setShowPassword((current) => !current)}
                            onToggleConfirm={() => setShowConfirm((current) => !current)}
                            onSubmit={handlePasswordSubmit}
                        />
                    )}

                    {step === 'complete' && (
                        <RegisterProfileStep
                            email={email}
                            name={name}
                            phone={phone}
                            errors={errors}
                            onBack={() => setStep('password')}
                            onNameChange={(value) => {
                                setName(value);
                                clearFieldError('name');
                            }}
                            onPhoneChange={(value) => {
                                setPhone(value);
                                clearFieldError('phone');
                            }}
                            onSubmit={handleCompleteSubmit}
                        />
                    )}
                </div>
            </AuthCard>
        </div>
    );
}
