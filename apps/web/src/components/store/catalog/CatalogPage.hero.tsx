import { ArrowRight } from 'lucide-react';
import { CatalogHeroProps } from './CatalogPage.types';

const HERO_STYLES = [
    {
        activeDotColor: 'bg-green-500',
        borderClass: 'border-b md:border-b-0 md:border-r border-white/20',
        getColors: (isActive: boolean) =>
            isActive
                ? 'bg-black text-white flex-[1.2]'
                : 'bg-neutral-900 text-gray-400 hover:bg-black hover:text-white flex-1',
    },
    {
        activeDotColor: 'bg-green-500',
        borderClass: 'border-b md:border-b-0 md:border-r border-gray-200',
        getColors: (isActive: boolean) =>
            isActive
                ? 'bg-white text-black flex-[1.2]'
                : 'bg-gray-100 text-gray-500 hover:bg-white hover:text-black flex-1',
    },
    {
        activeDotColor: 'bg-green-500',
        borderClass: '',
        getColors: (isActive: boolean) =>
            isActive
                ? 'bg-neutral-800 text-white flex-[1.2]'
                : 'bg-neutral-900 text-gray-500 hover:bg-neutral-800 hover:text-white flex-1',
    },
] as const;

export default function CatalogPageHero({ filter, counts, heroCategories, onFilterChange }: CatalogHeroProps) {
    if (heroCategories.length === 0) return null;

    const gridColsClass =
        heroCategories.length === 1
            ? 'grid-cols-1'
            : heroCategories.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-3';

    return (
        <div className="mb-8 border-b border-black md:mb-12">
            <div className={`grid ${gridColsClass}`}>
                {heroCategories.map((category, index) => {
                    const style = HERO_STYLES[index] ?? HERO_STYLES[2];
                    const isActive = filter === category.slug;
                    const blockStyle = category.imageUrl
                        ? {
                              backgroundImage: `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)), url(${category.imageUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                          }
                        : undefined;
                    const backgroundWord = (category.name.split(' ')[0] ?? category.name).toUpperCase();

                    return (
                        <button
                            key={category.slug}
                            onClick={() => onFilterChange(category.slug)}
                            className={`relative group flex h-[30vh] min-h-[220px] flex-col items-center justify-center overflow-hidden transition-all duration-500 md:h-[50vh] ${style.borderClass} ${style.getColors(isActive)}`}
                            style={blockStyle}
                        >
                            <span className="absolute text-[4.5rem] sm:text-[6rem] md:text-[10rem] font-display font-black italic opacity-5 pointer-events-none select-none whitespace-nowrap transform -rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110">
                                {backgroundWord}
                            </span>

                            <div className="relative z-10 text-center transform transition-transform duration-300 md:group-hover:-translate-y-2">
                                <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-black italic tracking-tighter uppercase">
                                    {category.name}
                                </h2>
                                <div className="mt-3 flex items-center justify-center gap-2 opacity-100 transition-opacity duration-300 md:mt-2 md:opacity-0 md:group-hover:opacity-100">
                                    <span className="text-xs font-bold tracking-widest uppercase border border-current px-3 py-1 rounded-full">
                                        {counts[category.slug] ?? 0} Productos
                                    </span>
                                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                            </div>

                            {isActive && (
                                <div className="absolute bottom-4 left-0 right-0 text-center animate-fade-in md:bottom-6">
                                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 text-white">
                                        <span className={`w-2 h-2 rounded-full animate-pulse ${style.activeDotColor}`} />
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
