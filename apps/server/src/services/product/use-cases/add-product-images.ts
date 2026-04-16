import prisma from "../../../config/prisma.js";
import { getProductByIdUseCase } from "./get-product-by-id.js";

export const addProductImagesUseCase = async (productId: string, urls: string[]) => {
    await getProductByIdUseCase(productId);

    return prisma.productImage.createMany({
        data: urls.map((url) => ({
            url,
            productId,
        })),
    });
};
