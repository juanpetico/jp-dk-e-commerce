export default function CategoryPageSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="animate-pulse">
                <div className="h-12 bg-gray-200 w-1/4 mx-auto mb-8 rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="aspect-[3/4] bg-gray-200 rounded" />
                    ))}
                </div>
            </div>
        </div>
    );
}
