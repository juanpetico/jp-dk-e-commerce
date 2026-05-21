export default function ProfileSettingsLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <div className="h-8 w-36 bg-muted rounded mb-8" />

            <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-border rounded-lg p-6">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <div className="h-5 w-40 bg-muted rounded" />
                                <div className="h-3 w-64 bg-muted rounded" />
                            </div>
                            <div className="h-9 w-20 bg-muted rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
