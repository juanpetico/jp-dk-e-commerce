export default function CatalogLoading() {
    return (
        <div className="min-h-screen pb-12 pt-20 md:pt-0 animate-pulse">
            <div className="mb-8 border-b border-muted md:mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-[30vh] min-h-[220px] md:h-[50vh] bg-muted" />
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col mb-12 border-b border-muted pb-6 gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="h-7 w-48 bg-muted rounded" />
                        <div className="flex gap-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-8 w-20 bg-muted rounded-full" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="aspect-square bg-muted rounded-lg" />
                            <div className="h-4 w-3/4 bg-muted rounded" />
                            <div className="h-4 w-1/3 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
