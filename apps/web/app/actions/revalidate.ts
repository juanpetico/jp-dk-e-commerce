'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function revalidateProducts() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)('products')
    revalidatePath('/catalog')
    revalidatePath('/', 'layout')
}

export async function revalidateCategories() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)('categories')
    revalidatePath('/catalog')
    revalidatePath('/', 'layout')
}

export async function revalidateProductBySlug(slug: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)(`product-${slug}`)
    revalidatePath(`/product/${slug}`)
}

export async function revalidateCategoryBySlug(slug: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)(`category-${slug}`)
    revalidatePath('/catalog')
}

export async function revalidateAll() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)('products')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)('categories')
    revalidatePath('/', 'layout')
}
