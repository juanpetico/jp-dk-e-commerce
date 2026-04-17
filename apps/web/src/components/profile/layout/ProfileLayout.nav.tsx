import Link from 'next/link';
import { ProfileLayoutNavProps } from './ProfileLayout.types';
import { getProfileNavLinkClassName, PROFILE_NAVIGATION_ITEMS } from './ProfileLayout.utils';

export default function ProfileLayoutNav({ isActivePath }: ProfileLayoutNavProps) {
    return (
        <div className="hidden md:flex items-center gap-8">
            {PROFILE_NAVIGATION_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className={getProfileNavLinkClassName(isActivePath(item.href))}>
                    {item.label}
                </Link>
            ))}
        </div>
    );
}
