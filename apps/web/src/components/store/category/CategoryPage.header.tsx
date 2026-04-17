import Link from 'next/link';
import { CategoryPageHeaderProps } from './CategoryPage.types';
import { getCategoryNavItemClassName } from './CategoryPage.utils';

export default function CategoryPageHeader({ categoryName, currentSlug, categories }: CategoryPageHeaderProps) {
    return (
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight mb-4">{categoryName}</h1>

            <div className="flex justify-center gap-6 mb-8">
                <Link href="/catalog">
                    <span className={getCategoryNavItemClassName(false)}>Todos</span>
                </Link>
                {categories.map((category) => (
                    <Link key={category.id} href={`/category/${category.slug}`}>
                        <span className={getCategoryNavItemClassName(category.slug === currentSlug)}>{category.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
