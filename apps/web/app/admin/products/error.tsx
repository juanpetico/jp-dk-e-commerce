'use client';

import React from 'react';
import AdminDataLoadErrorState from '@/components/admin/shared/AdminDataLoadErrorState';

interface ProductsPageErrorProps {
    error: Error;
    reset: () => void;
}

export default function ProductsPageError({ error, reset }: ProductsPageErrorProps) {
    return <AdminDataLoadErrorState message={error.message || 'Error al cargar productos'} onRetry={reset} />;
}
