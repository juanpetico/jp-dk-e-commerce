import { Product } from '../types';

const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Polera Shooters Pink Black',
        price: 25990,
        images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'],
        category: 'Poleras',
        sizes: ['S', 'M', 'L'],
        isNew: true
    },
    {
        id: '2',
        name: 'Polera Shooters Blue Black',
        price: 25990,
        images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80'],
        category: 'Poleras',
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: '3',
        name: 'Polera Shooters Blue White',
        price: 23990,
        images: ['https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80'],
        category: 'Poleras',
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: '4',
        name: 'Polera Shooters Pink White',
        price: 23390,
        originalPrice: 25990,
        images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80'],
        category: 'Poleras',
        sizes: ['S', 'M', 'L'],
        isSale: true
    },
    {
        id: '5',
        name: 'Polerón Shooters Ultra Pink',
        price: 34990,
        images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
        category: 'Polerones',
        sizes: ['M', 'L']
    },
    {
        id: '6',
        name: 'Polerón Shooters Ultra Melange',
        price: 34990,
        images: ['https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&w=800&q=80'],
        category: 'Polerones',
        sizes: ['M', 'L', 'XL']
    },
    {
        id: '7',
        name: 'Polera JP Signature White',
        price: 25990,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'],
        category: 'Poleras',
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: '8',
        name: 'Polera Graphic Oversize',
        price: 28990,
        images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80'],
        category: 'Poleras',
        sizes: ['S', 'M', 'L', 'XL']
    }
];

const API_URL = 'http://localhost:3001';

export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        return await res.json();
    } catch (error) {
        console.warn("API disconnect, using mock data", error);
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_PRODUCTS), 500);
        });
    }
};

export const fetchProductById = async (id: string): Promise<Product | undefined> => {
    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        return await res.json();
    } catch (error) {
        console.warn("API disconnect, using mock data", error);
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_PRODUCTS.find(p => p.id === id)), 300);
        });
    }
};
