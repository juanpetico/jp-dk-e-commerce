export default function CheckoutLoading() {
    return (
        <div className="min-h-screen pt-20 pb-12 animate-pulse">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-8 w-40 bg-muted rounded mb-8" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="h-6 w-32 bg-muted rounded" />
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-10 bg-muted rounded" />
                            ))}
                        </div>
                        <div className="h-6 w-32 bg-muted rounded mt-6" />
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-10 bg-muted rounded" />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="h-6 w-32 bg-muted rounded" />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className="w-16 h-20 bg-muted rounded flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 bg-muted rounded" />
                                    <div className="h-4 w-1/3 bg-muted rounded" />
                                </div>
                            </div>
                        ))}
                        <div className="border-t border-muted pt-4 space-y-2">
                            <div className="flex justify-between">
                                <div className="h-4 w-20 bg-muted rounded" />
                                <div className="h-4 w-16 bg-muted rounded" />
                            </div>
                            <div className="flex justify-between">
                                <div className="h-5 w-16 bg-muted rounded" />
                                <div className="h-5 w-20 bg-muted rounded" />
                            </div>
                        </div>
                        <div className="h-12 bg-muted rounded mt-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
