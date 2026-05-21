export default function DashboardLoading() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-7 w-44 rounded-md bg-muted" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-lg bg-muted" />
                ))}
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 h-64 rounded-lg bg-muted" />
                <div className="h-64 rounded-lg bg-muted" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="h-48 rounded-lg bg-muted" />
                <div className="h-48 rounded-lg bg-muted" />
            </div>
        </div>
    );
}
