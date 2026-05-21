export default function ProfilePageLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <div className="h-8 w-32 bg-muted rounded mb-8" />

            <div className="border border-border rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-muted rounded-full" />
                    <div className="space-y-2">
                        <div className="h-5 w-40 bg-muted rounded" />
                        <div className="h-4 w-48 bg-muted rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-1">
                            <div className="h-3 w-20 bg-muted rounded" />
                            <div className="h-5 w-36 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="border border-border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="h-5 w-32 bg-muted rounded" />
                    <div className="h-8 w-24 bg-muted rounded-md" />
                </div>
                <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="border border-border rounded-md p-4">
                            <div className="h-4 w-1/2 bg-muted rounded mb-2" />
                            <div className="h-3 w-1/3 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
