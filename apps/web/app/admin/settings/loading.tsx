export default function SettingsLoading() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between">
                <div className="h-7 w-44 rounded-md bg-muted" />
                <div className="h-9 w-28 rounded-md bg-muted" />
            </div>

            <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm dark:border-none">
                <div className="h-5 w-40 rounded-md bg-muted" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 w-24 rounded bg-muted" />
                            <div className="h-9 w-full rounded-md bg-muted" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm dark:border-none">
                <div className="h-5 w-40 rounded-md bg-muted" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[0, 1].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 w-24 rounded bg-muted" />
                            <div className="h-9 w-full rounded-md bg-muted" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
