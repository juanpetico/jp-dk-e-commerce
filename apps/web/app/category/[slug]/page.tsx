import { permanentRedirect } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;
    permanentRedirect(`/catalog?category=${slug}`);
}
