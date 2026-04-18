interface LookbookCarouselDotsProps {
    total: number;
    activeIndex: number;
    onSelect: (index: number) => void;
}

export default function LookbookCarouselDots({ total, activeIndex, onSelect }: LookbookCarouselDotsProps) {
    if (total === 0) return null;

    return (
        <div className="flex justify-center gap-2 mt-4 cursor-pointer">
            {Array.from({ length: total }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === activeIndex ? 'bg-white scale-125' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                />
            ))}
        </div>
    );
}
