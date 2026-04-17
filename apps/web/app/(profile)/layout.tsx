import ProfileLayoutClient from '@/components/profile/layout/ProfileLayoutClient';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <ProfileLayoutClient>{children}</ProfileLayoutClient>;
}
