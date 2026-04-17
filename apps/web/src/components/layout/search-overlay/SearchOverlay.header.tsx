import { Search, X } from 'lucide-react';
import { SearchOverlayHeaderProps } from './SearchOverlay.types';

export default function SearchOverlayHeader({
    searchTerm,
    inputRef,
    onChangeSearchTerm,
    onClear,
    onClose,
}: SearchOverlayHeaderProps) {
    return (
        <div className="relative pt-6 px-4 md:px-8 pb-4">
            <div className="max-w-4xl mx-auto w-full">
                <div className="border border-border px-4 py-3 flex items-center bg-background rounded-lg">
                    <div className="flex flex-col flex-1">
                        <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Busqueda</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(event) => onChangeSearchTerm(event.target.value)}
                            className="bg-transparent text-foreground text-lg font-medium focus:outline-none w-full placeholder-muted-foreground"
                            placeholder="Buscar productos..."
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {searchTerm && (
                            <button onClick={onClear} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                        <Search className="w-6 h-6 text-foreground" />

                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-destructive transition-colors ml-2 pl-2 border-l border-border"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
