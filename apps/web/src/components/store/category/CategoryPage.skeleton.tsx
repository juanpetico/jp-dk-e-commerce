export default function CategoryPageSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
            <div className="text-center mb-12">
                <div className="h-14 w-64 bg-muted rounded mx-auto mb-6" />
                <div className="flex justify-center gap-6 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-5 w-16 bg-muted rounded-full" />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <div className="aspect-[3/4] bg-muted rounded" />
                        <div className="h-4 w-3/4 bg-muted rounded" />
                        <div className="h-4 w-1/3 bg-muted rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
