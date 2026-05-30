import { CatalogQuickFiltersProps } from './CatalogPage.types';

export default function CatalogPageQuickFilters({
    filter,
    searchTerm,
    filteredCount,
    allCategories,
    onFilterChange,
    onClearSearch,
}: CatalogQuickFiltersProps) {
    const activeCategory = allCategories.find((c) => c.slug === filter);

    return (
        <>
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
                        {filter === 'All' ? 'Catálogo Completo' : (activeCategory?.name ?? filter)}
                        <span className="bg-foreground text-background text-xs font-bold px-2 py-1 rounded-full align-middle font-sans">
                            {filteredCount}
                        </span>
                    </h1>

                    <div className="flex gap-2 flex-wrap justify-center">
                        <button
                            onClick={() => onFilterChange('All')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all ${
                                filter === 'All'
                                    ? 'bg-foreground text-background'
                                    : 'text-foreground/50 hover:text-foreground'
                            }`}
                        >
                            Ver Todo
                        </button>
                        {allCategories.map((category) => (
                            <button
                                key={category.slug}
                                onClick={() => onFilterChange(category.slug)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all ${
                                    filter === category.slug
                                        ? 'bg-foreground text-background'
                                        : 'text-foreground/50 hover:text-foreground'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {searchTerm && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground/50">Resultados para:</span>
                        <span className="font-bold text-sm bg-muted text-foreground px-3 py-1 rounded-full flex items-center gap-2">
                            &quot;{searchTerm}&quot;
                            <button onClick={onClearSearch} className="text-foreground/40 hover:text-foreground">
                                &times;
                            </button>
                        </span>
                    </div>
                )}
            </div>

            <div className="h-px bg-gray-300 dark:bg-gray-700 mb-12" />
        </>
    );
}
