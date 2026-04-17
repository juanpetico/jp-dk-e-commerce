export const getCategoryNavItemClassName = (isActive: boolean) => {
    return [
        'text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors',
        isActive ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black',
    ].join(' ');
};
