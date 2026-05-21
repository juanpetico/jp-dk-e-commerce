'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function revalidateProducts() {
    revalidateTag('products')
    revalidatePath('/catalog')
    revalidatePath('/', 'layout')
}

export async function revalidateCategories() {
    revalidateTag('categories')
    revalidatePath('/catalog')
    revalidatePath('/', 'layout')
}

export async function revalidateProductBySlug(slug: string) {
    revalidateTag(`product-${slug}`)
    revalidatePath(`/product/${slug}`)
}

export async function revalidateCategoryBySlug(slug: string) {
    revalidateTag(`category-${slug}`)
    revalidatePath(`/category/${slug}`)
}

export async function revalidateAll() {
    revalidateTag('products')
    revalidateTag('categories')
    revalidatePath('/', 'layout')
}
