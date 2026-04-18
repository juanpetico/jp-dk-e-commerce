'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchMyCoupons, MyCoupon } from '@/services/couponService';
import CouponsPageEmpty from './CouponsPage.empty';
import CouponsPageGrid from './CouponsPage.grid';
import CouponsPageHeader from './CouponsPage.header';
import CouponsPageSkeleton from './CouponsPage.skeleton';

export default function CouponsPageClient() {
    const [coupons, setCoupons] = useState<MyCoupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const loadCoupons = async () => {
            try {
                setHasError(false);
                const data = await fetchMyCoupons();
                setCoupons(data);
            } catch (error) {
                console.error('Error loading coupons:', error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };

        void loadCoupons();
    }, []);

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Codigo ${code} copiado`);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (isLoading) {
        return <CouponsPageSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-4xl">
                <CouponsPageHeader totalCoupons={coupons.length} />
                {coupons.length === 0 ? (
                    <CouponsPageEmpty hasError={hasError} />
                ) : (
                    <CouponsPageGrid coupons={coupons} copiedCode={copiedCode} onCopy={copyToClipboard} />
                )}
            </div>
        </div>
    );
}
