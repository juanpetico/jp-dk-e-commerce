import ProfileLayoutClient from '@/components/profile/layout/ProfileLayoutClient';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute roles={['CLIENT', 'ADMIN', 'SUPERADMIN']}>
            <ProfileLayoutClient>{children}</ProfileLayoutClient>
        </ProtectedRoute>
    );
}
