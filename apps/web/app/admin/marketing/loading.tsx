export default function MarketingLoading() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between">
                <div className="h-7 w-44 rounded-md bg-muted" />
                <div className="h-9 w-36 rounded-md bg-muted" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-lg bg-muted" />
                ))}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="h-9 w-64 rounded-md bg-muted" />
                <div className="h-9 w-28 rounded-md bg-muted" />
                <div className="h-9 w-28 rounded-md bg-muted" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-40 rounded-lg bg-muted" />
                ))}
            </div>

            <div className="h-48 rounded-lg bg-muted" />
        </div>
    );
}
