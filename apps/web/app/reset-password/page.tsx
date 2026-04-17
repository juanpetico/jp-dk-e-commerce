import { Suspense } from 'react';
import ResetPasswordPageClient from '@/components/auth/reset-password/ResetPasswordPageClient';

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordPageClient />
        </Suspense>
    );
}
