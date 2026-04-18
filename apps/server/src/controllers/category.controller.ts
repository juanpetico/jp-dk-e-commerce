import {
    createCategory,
    deleteCategory,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    patchCategory,
    updateCategory,
} from "./category/category.handlers.js";
import { categoryPartialValidation, categoryValidation } from "./category/category.validators.js";

export { categoryValidation, categoryPartialValidation };

export const categoryController = {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    patchCategory,
};
