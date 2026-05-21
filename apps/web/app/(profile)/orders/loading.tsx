export default function ProfileOrdersLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <div className="flex items-center justify-between mb-8">
                <div className="h-8 w-32 bg-muted rounded" />
                <div className="h-9 w-28 bg-muted rounded-md" />
            </div>

            <div className="flex gap-2 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 w-24 bg-muted rounded-full" />
                ))}
            </div>

            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border border-border rounded-lg p-4 flex items-center gap-4">
                        <div className="w-14 h-14 bg-muted rounded" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-muted rounded" />
                            <div className="h-3 w-1/4 bg-muted rounded" />
                        </div>
                        <div className="h-6 w-20 bg-muted rounded-full" />
                        <div className="h-5 w-16 bg-muted rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
