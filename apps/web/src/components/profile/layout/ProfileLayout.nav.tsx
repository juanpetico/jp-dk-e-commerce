import Link from 'next/link';
import { ProfileLayoutNavProps } from './ProfileLayout.types';
import { getProfileNavLinkClassName, PROFILE_NAVIGATION_ITEMS } from './ProfileLayout.utils';

export default function ProfileLayoutNav({ isActivePath, variant = 'desktop' }: ProfileLayoutNavProps) {
    const containerClassName =
        variant === 'desktop'
            ? 'hidden md:flex items-center gap-8'
            : 'flex md:hidden items-center gap-6 overflow-x-auto whitespace-nowrap py-3 -mx-4 px-4 sm:-mx-6 sm:px-6';

    return (
        <div className={containerClassName}>
            {PROFILE_NAVIGATION_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className={getProfileNavLinkClassName(isActivePath(item.href))}>
                    {item.label}
                </Link>
            ))}
        </div>
    );
}
