export default function CouponsPageSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <div className="mb-8">
                <div className="h-8 w-40 bg-muted rounded mb-2" />
                <div className="h-4 w-56 bg-muted rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-border rounded-lg p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="h-6 w-24 bg-muted rounded" />
                            <div className="h-5 w-12 bg-muted rounded-full" />
                        </div>
                        <div className="h-4 w-3/4 bg-muted rounded" />
                        <div className="h-3 w-1/2 bg-muted rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
