import {
    addProductImages,
    createProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    getProductBySlug,
    getProductsByCategory,
    removeProductImage,
    updateProduct,
} from "./product/product.handlers.js";
import { productValidation } from "./product/product.validators.js";

export { productValidation };

export const productController = {
    createProduct,
    getAllProducts,
    getProductById,
    getProductBySlug,
    updateProduct,
    deleteProduct,
    addProductImages,
    removeProductImage,
    getProductsByCategory,
};
