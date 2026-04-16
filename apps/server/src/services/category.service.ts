import { createCategoryUseCase } from "./category/use-cases/create-category.js";
import { deleteCategoryUseCase } from "./category/use-cases/delete-category.js";
import { getAllCategoriesUseCase } from "./category/use-cases/get-all-categories.js";
import { getCategoryByIdUseCase } from "./category/use-cases/get-category-by-id.js";
import { getCategoryBySlugUseCase } from "./category/use-cases/get-category-by-slug.js";
import { updateCategoryFieldsUseCase } from "./category/use-cases/update-category-fields.js";
import type { CategoryFieldsUpdateInput, CategoryFilters } from "./category/category.types.js";

export const categoryService = {
    async createCategory(name: string, actorId: string) {
        return createCategoryUseCase(name, actorId);
    },

    async getAllCategories(filters?: CategoryFilters) {
        return getAllCategoriesUseCase(filters);
    },

    async getCategoryById(id: string) {
        return getCategoryByIdUseCase(id);
    },

    async getCategoryBySlug(slug: string, filters?: CategoryFilters) {
        return getCategoryBySlugUseCase(slug, filters);
    },

    async updateCategory(id: string, name: string) {
        return this.updateCategoryFields(id, { name });
    },

    async updateCategoryFields(id: string, fields: CategoryFieldsUpdateInput, actorId?: string) {
        return updateCategoryFieldsUseCase(id, fields, actorId);
    },

    async deleteCategory(id: string, actorId: string) {
        return deleteCategoryUseCase(id, actorId);
    },
};
