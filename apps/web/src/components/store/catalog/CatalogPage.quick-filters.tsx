import { CatalogQuickFiltersProps } from './CatalogPage.types';

export default function CatalogPageQuickFilters({
    filter,
    searchTerm,
    filteredCount,
    categories,
    onFilterChange,
    onClearSearch,
}: CatalogQuickFiltersProps) {
    return (
        <div className="flex flex-col mb-12 border-b border-gray-100 pb-6 gap-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
                    {filter === 'All' ? 'Catalogo Completo' : filter}
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full align-middle font-sans">
                        {filteredCount}
                    </span>
                </h1>

                <div className="flex gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => onFilterChange(category)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all ${
                                filter === category ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            {category === 'All' ? 'Ver Todo' : category}
                        </button>
                    ))}
                </div>
            </div>

            {searchTerm && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Resultados para:</span>
                    <span className="font-bold text-sm bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                        "{searchTerm}"
                        <button onClick={onClearSearch} className="text-gray-400 hover:text-black">
                            &times;
                        </button>
                    </span>
                </div>
            )}
        </div>
    );
}
