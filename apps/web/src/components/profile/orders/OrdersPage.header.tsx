import { Filter, Grid3x3, List, X } from 'lucide-react';
import { OrdersPageHeaderProps } from './OrdersPage.types';

export default function OrdersPageHeader({
    viewMode,
    showViewDropdown,
    isFilterActive,
    onViewModeChange,
    onToggleViewDropdown,
    onToggleFilter,
    onResetFilters,
}: OrdersPageHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">Pedidos</h1>

            <div className="flex gap-2">
                <div className="relative">
                    <button
                        onClick={onToggleViewDropdown}
                        className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                        {viewMode === 'gallery' ? <Grid3x3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                        {viewMode === 'gallery' ? 'Galeria' : 'Lista'}
                        <span className="text-xs">v</span>
                    </button>

                    {showViewDropdown && (
                        <div className="absolute right-0 mt-2 w-40 bg-popover text-popover-foreground border border-border rounded-lg shadow-xl z-20 py-1">
                            <button
                                onClick={() => onViewModeChange('gallery')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <Grid3x3 className="w-4 h-4" />
                                Galeria
                            </button>
                            <button
                                onClick={() => onViewModeChange('list')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <List className="w-4 h-4" />
                                Lista
                            </button>
                        </div>
                    )}
                </div>

                {isFilterActive && (
                    <div className="relative group">
                        <button
                            onClick={onResetFilters}
                            className="bg-destructive/10 text-destructive hover:bg-destructive/20 p-2 rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground border border-border text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-sm">
                            Borrar filtros
                        </div>
                    </div>
                )}

                <div className="relative group">
                    <button
                        onClick={onToggleFilter}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 p-2 rounded transition-colors"
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground border border-border text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-sm">
                        Filtro
                    </div>
                </div>
            </div>
        </div>
    );
}
