'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Review {
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    verified: boolean;
}

// Mock data — reemplazar con fetch al backend cuando exista el endpoint
const MOCK_REVIEWS: Review[] = [
    {
        id: '1',
        author: 'Camila R.',
        rating: 5,
        date: '2025-03-12',
        comment: 'Excelente calidad, la tela es muy cómoda y el estampado se ve increíble. Totalmente recomendada.',
        verified: true,
    },
    {
        id: '2',
        author: 'Matías G.',
        rating: 4,
        date: '2025-02-28',
        comment: 'Muy buena polera, llegó antes de lo esperado. Le doy 4 estrellas porque el talle viene un poco grande.',
        verified: true,
    },
    {
        id: '3',
        author: 'Valentina S.',
        rating: 5,
        date: '2025-01-15',
        comment: 'Segunda vez que compro y no defrauda. El algodón heavyweight se nota en la calidad.',
        verified: false,
    },
];

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
    const iconSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(iconSize, star <= rating ? 'fill-black dark:fill-white text-black dark:text-white' : 'fill-gray-200 dark:fill-zinc-700 text-gray-200 dark:text-zinc-700')}
                />
            ))}
        </div>
    );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-4 text-right">{star}</span>
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-black dark:bg-white rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-4">{count}</span>
        </div>
    );
}

export default function ProductPageReviews() {
    const [reviews] = useState<Review[]>(MOCK_REVIEWS);

    const total = reviews.length;
    const average = total > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / total : 0;
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
    }));

    return (
        <section className="mt-16 border-t border-gray-200 dark:border-zinc-800 pt-12">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-8">Reseñas</h2>

            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                {/* Resumen */}
                <div className="lg:col-span-3 mb-8 lg:mb-0">
                    <div className="flex flex-col items-start gap-3">
                        <span className="text-5xl font-bold">{average.toFixed(1)}</span>
                        <StarRating rating={Math.round(average)} size="lg" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">{total} reseñas</span>
                        <div className="w-full space-y-1.5 mt-2">
                            {distribution.map(({ star, count }) => (
                                <RatingBar key={star} star={star} count={count} total={total} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lista de reseñas */}
                <div className="lg:col-span-9 space-y-6">
                    {reviews.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aún no hay reseñas para este producto.</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-100 dark:border-zinc-800 pb-6 last:border-0">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-sm uppercase tracking-wide">{review.author}</span>
                                        {review.verified && (
                                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Compra verificada</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 dark:text-zinc-600">
                                        {new Date(review.date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                <StarRating rating={review.rating} />
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
