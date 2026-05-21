export default function ProductPageSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
            <div className="flex gap-2 mb-8">
                <div className="h-3 w-10 bg-muted rounded" />
                <div className="h-3 w-3 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-3 w-3 bg-muted rounded" />
                <div className="h-3 w-28 bg-muted rounded" />
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-7">
                    <div className="aspect-[4/5] bg-muted rounded-lg mb-4" />
                    <div className="grid grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="aspect-square bg-muted rounded" />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-5 mt-8 lg:mt-0 flex flex-col gap-6">
                    <div>
                        <div className="h-10 w-3/4 bg-muted rounded mb-3" />
                        <div className="h-7 w-1/4 bg-muted rounded" />
                    </div>

                    <div className="h-px bg-muted" />

                    <div>
                        <div className="h-4 w-12 bg-muted rounded mb-3" />
                        <div className="flex gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="w-12 h-12 bg-muted rounded-md" />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="h-4 w-20 bg-muted rounded mb-3" />
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted rounded" />
                            <div className="w-12 h-6 bg-muted rounded" />
                            <div className="w-10 h-10 bg-muted rounded" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="h-12 w-full bg-muted rounded-md" />
                        <div className="h-12 w-full bg-muted rounded-md" />
                    </div>

                    <div className="h-16 bg-muted rounded-lg" />

                    <div className="space-y-3">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-full bg-muted rounded" />
                        <div className="h-3 w-5/6 bg-muted rounded" />
                        <div className="h-3 w-4/5 bg-muted rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}
