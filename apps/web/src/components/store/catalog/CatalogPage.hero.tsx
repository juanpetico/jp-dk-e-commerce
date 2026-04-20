import { ArrowRight } from 'lucide-react';
import { CatalogFilter, CatalogHeroProps } from './CatalogPage.types';

const HERO_BLOCKS: Array<{ filter: Exclude<CatalogFilter, 'All'>; label: string; backgroundWord: string; activeDotColor: string; className: string }> = [
    {
        filter: 'Poleras',
        label: 'Poleras',
        backgroundWord: 'TSHIRT',
        activeDotColor: 'bg-green-500',
        className: 'border-b md:border-b-0 md:border-r border-white/20',
    },
    {
        filter: 'Polerones',
        label: 'Polerones',
        backgroundWord: 'HOODIE',
        activeDotColor: 'bg-black',
        className: 'border-b md:border-b-0 md:border-r border-gray-200',
    },
    {
        filter: 'Lentes',
        label: 'Lentes',
        backgroundWord: 'SHADES',
        activeDotColor: 'bg-yellow-400',
        className: '',
    },
];

const getBlockColors = (blockFilter: Exclude<CatalogFilter, 'All'>, activeFilter: CatalogFilter) => {
    const isActive = activeFilter === blockFilter;

    if (blockFilter === 'Poleras') {
        return isActive
            ? 'bg-black text-white flex-[1.2]'
            : 'bg-neutral-900 text-gray-400 hover:bg-black hover:text-white flex-1';
    }

    if (blockFilter === 'Polerones') {
        return isActive
            ? 'bg-white text-black flex-[1.2]'
            : 'bg-gray-100 text-gray-500 hover:bg-white hover:text-black flex-1';
    }

    return isActive
        ? 'bg-neutral-800 text-white flex-[1.2]'
        : 'bg-neutral-900 text-gray-500 hover:bg-neutral-800 hover:text-white flex-1';
};

export default function CatalogPageHero({ filter, counts, imagesByFilter, onFilterChange }: CatalogHeroProps) {
    return (
        <div className="mb-8 border-b border-black md:mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3">
                {HERO_BLOCKS.map((block) => {
                    const isActive = filter === block.filter;
                    const imageUrl = imagesByFilter[block.filter];
                    const blockStyle = imageUrl
                        ? {
                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }
                        : undefined;

                    return (
                        <button
                            key={block.filter}
                            onClick={() => onFilterChange(block.filter)}
                            className={`relative group flex h-[30vh] min-h-[220px] flex-col items-center justify-center overflow-hidden transition-all duration-500 md:h-[50vh] ${block.className} ${getBlockColors(block.filter, filter)}`}
                            style={blockStyle}
                        >
                            <span className="absolute text-[4.5rem] sm:text-[6rem] md:text-[10rem] font-display font-black italic opacity-5 pointer-events-none select-none whitespace-nowrap transform -rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110">
                                {block.backgroundWord}
                            </span>

                            <div className="relative z-10 text-center transform transition-transform duration-300 md:group-hover:-translate-y-2">
                                <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-black italic tracking-tighter uppercase">
                                    {block.label}
                                </h2>
                                <div className="mt-3 flex items-center justify-center gap-2 opacity-100 transition-opacity duration-300 md:mt-2 md:opacity-0 md:group-hover:opacity-100">
                                    <span className="text-xs font-bold tracking-widest uppercase border border-current px-3 py-1 rounded-full">
                                        {counts[block.filter]} Productos
                                    </span>
                                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                            </div>

                            {isActive && (
                                <div className="absolute bottom-4 left-0 right-0 text-center animate-fade-in md:bottom-6">
                                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2">
                                        <span className={`w-2 h-2 rounded-full animate-pulse ${block.activeDotColor}`} />
                                        Seleccionado
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
