export {
    getAllProducts,
    getProductById,
    getProductBySlug,
    getProductsByCategory,
} from "./handlers/product.read.handlers.js";
export { createProduct, updateProduct, deleteProduct } from "./handlers/product.write.handlers.js";
export { addProductImages, removeProductImage } from "./handlers/product.media.handlers.js";
