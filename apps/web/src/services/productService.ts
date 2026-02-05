import { Product } from '../types';

const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Polera Shooters Pink Black',
        price: 25990,
        images: [{ id: 'img1', url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80', productId: '1' }],
        category: { id: 'c1', name: 'Poleras', slug: 'poleras' },
        sizes: ['S', 'M', 'L'],
        isNew: true,
        stock: 50,
        slug: 'polera-shooters-pink-black',
        isPublished: true
    },
    {
        id: '2',
        name: 'Polera Shooters Blue Black',
        price: 25990,
        images: [{ id: 'img2', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80', productId: '2' }],
        category: { id: 'c1', name: 'Poleras', slug: 'poleras' },
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 35,
        slug: 'polera-shooters-blue-black',
        isPublished: true
    },
    {
        id: '3',
        name: 'Polera Shooters Blue White',
        price: 23990,
        images: [{ id: 'img3', url: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80', productId: '3' }],
        category: { id: 'c1', name: 'Poleras', slug: 'poleras' },
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 20,
        slug: 'polera-shooters-blue-white',
        isPublished: true
    },
    {
        id: '4',
        name: 'Polera Shooters Pink White',
        price: 23390,
        originalPrice: 25990,
        images: [{ id: 'img4', url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80', productId: '4' }],
        category: { id: 'c1', name: 'Poleras', slug: 'poleras' },
        sizes: ['S', 'M', 'L'],
        isSale: true,
        stock: 15,
        slug: 'polera-shooters-pink-white',
        isPublished: true
    },
    {
        id: '5',
        name: 'Polerón Shooters Ultra Pink',
        price: 34990,
        images: [{ id: 'img5', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', productId: '5' }],
        category: { id: 'c2', name: 'Polerones', slug: 'polerones' },
        sizes: ['M', 'L'],
        stock: 10,
        slug: 'poleron-shooters-ultra-pink',
        isPublished: true
    },
    {
        id: '6',
        name: 'Polerón Shooters Ultra Melange',
        price: 34990,
        images: [{ id: 'img6', url: 'https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&w=800&q=80', productId: '6' }],
        category: { id: 'c2', name: 'Polerones', slug: 'polerones' },
        sizes: ['M', 'L', 'XL'],
        stock: 45,
        slug: 'poleron-shooters-ultra-melange',
        isPublished: true
    },
    {
        id: '7',
        name: 'Polera JP Signature White',
        price: 25990,
        images: [{ id: 'img7', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80', productId: '7' }],
        category: { id: 'c1', name: 'Poleras', slug: 'poleras' },
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 100,
        slug: 'polera-jp-signature-white',
        isPublished: true
    },
    {
        id: '8',
        name: 'Polera Graphic Oversize',
        price: 28990,
        images: [{ id: 'img8', url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80', productId: '8' }],
        category: { id: 'c1', name: 'Poleras', slug: 'poleras' },
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 60,
        slug: 'polera-graphic-oversize',
        isPublished: true
    }
];

const API_URL = 'http://localhost:5001/api';

export const fetchProducts = async (filters?: Record<string, any>): Promise<Product[]> => {
    try {
        const queryParams = new URLSearchParams();
        // Default to published products only for store views
        // If isPublished is explicitly 'all', we don't append the filter
        if (!filters || (filters.isPublished === undefined)) {
            queryParams.append('isPublished', 'true');
        }

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    // Skip appending to query params if it's our special 'all' value
                    if (key === 'isPublished' && value === 'all') return;
                    queryParams.append(key, String(value));
                }
            });
        }
        const queryString = queryParams.toString();
        const url = `${API_URL}/products${queryString ? `?${queryString}` : ''}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch products');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.warn("API disconnect, using mock data", error);
        // Basic local filtering for mock data if API fails
        let filteredMock = [...MOCK_PRODUCTS];

        if (filters) {
            if (filters.search) {
                const lowerSearch = String(filters.search).toLowerCase();
                filteredMock = filteredMock.filter(p => p.name.toLowerCase().includes(lowerSearch));
            }
            if (filters.categoryId) {
                filteredMock = filteredMock.filter(p => p.category.id === filters.categoryId);
            }
            // We can support other filters here too if needed
        }

        return new Promise((resolve) => {
            setTimeout(() => resolve(filteredMock), 500);
        });
    }
};

export const fetchProductById = async (id: string): Promise<Product | undefined> => {
    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.warn("API disconnect, using mock data", error);
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_PRODUCTS.find(p => p.id === id)), 300);
        });
    }
};
// ... existing imports
// Add methods after fetchProductById

export const fetchProductBySlug = async (slug: string): Promise<Product | undefined> => {
    try {
        const res = await fetch(`${API_URL}/products/slug/${slug}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.warn("API disconnect, using mock data", error);
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_PRODUCTS.find(p => p.slug === slug)), 300);
        });
    }
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    // Simplistic token retrieval, ideally use a helper or the context if passed, 
    // but services usually simple fetch wrappers. 
    // Assuming backend handles auth via Header "Authorization: Bearer <token>"

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(productData),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create product');
    }

    const json = await res.json();
    return json.data;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(productData),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update product');
    }

    const json = await res.json();
    return json.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete product');
    }
};
