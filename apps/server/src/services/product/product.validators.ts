import { AppError } from "../../middleware/error-handler.js";
import type { UpdateProductData } from "./product.types.js";

export const assertPriceIntegrity = (
    price: number,
    originalPrice?: number | null
) => {
    if (originalPrice !== undefined && originalPrice !== null) {
        if (originalPrice <= price) {
            throw new AppError("Precio inválido: El precio original debe ser mayor que el precio actual", 400);
        }
    }
};

export const validateUpdateProductPricing = (currentPrice: number, currentOriginalPrice: number | null, productData: UpdateProductData) => {
    if (productData.originalPrice !== undefined && productData.originalPrice !== null) {
        const priceToCheck = productData.price !== undefined ? productData.price : currentPrice;
        if (productData.originalPrice <= priceToCheck) {
            throw new AppError("Precio inválido: El precio original debe ser mayor que el precio actual", 400);
        }
    } else if (productData.price !== undefined) {
        if (currentOriginalPrice && currentOriginalPrice <= productData.price) {
            throw new AppError("Precio inválido: El precio original debe ser mayor que el precio actual", 400);
        }
    }
};
