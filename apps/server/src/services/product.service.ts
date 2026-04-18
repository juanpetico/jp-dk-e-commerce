import prisma from "../config/prisma.js";
import { getAllProductsUseCase } from "./product/use-cases/get-all-products.js";
import type { CreateProductData, ProductFilters, UpdateProductData } from "./product/product.types.js";
import { createProductUseCase } from "./product/use-cases/create-product.js";
import { getProductByIdUseCase } from "./product/use-cases/get-product-by-id.js";
import { getProductBySlugUseCase } from "./product/use-cases/get-product-by-slug.js";
import { getProductsByCategoryUseCase } from "./product/use-cases/get-products-by-category.js";
import { updateProductUseCase } from "./product/use-cases/update-product.js";
import { deleteProductUseCase } from "./product/use-cases/delete-product.js";
import { addProductImagesUseCase } from "./product/use-cases/add-product-images.js";
import { removeProductImageUseCase } from "./product/use-cases/remove-product-image.js";

export const productService = {
    async createProduct(data: CreateProductData, actorId: string) {
        return createProductUseCase(data, actorId);
    },

    // ... (getAllProducts, getProductById, getProductBySlug remain similar but ensure filters are correct in getAllProducts if needed)
    async getAllProducts(filters?: ProductFilters) {
        return getAllProductsUseCase(filters);
    },

    // ... getProductById ...
    async getProductById(id: string) {
        return getProductByIdUseCase(id);
    },

    async getProductBySlug(slug: string) {
        return getProductBySlugUseCase(slug);
    },

    async updateProduct(
        id: string,
        actorId: string,
        productData: UpdateProductData
    ) {
        return updateProductUseCase(id, actorId, productData);
    },

    async deleteProduct(id: string, actorId: string) {
        return deleteProductUseCase(id, actorId);
    },

    async addProductImages(productId: string, urls: string[]) {
        return addProductImagesUseCase(productId, urls);
    },

    async removeProductImage(imageId: string) {
        return removeProductImageUseCase(imageId);
    },

    async getProductsByCategory(categoryId: string) {
        return getProductsByCategoryUseCase(categoryId);
    },
};
