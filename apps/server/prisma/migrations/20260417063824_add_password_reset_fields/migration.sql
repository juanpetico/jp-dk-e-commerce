-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT;

-- CreateIndex
CREATE INDEX "Category_isPublished_idx" ON "Category"("isPublished");

-- CreateIndex
CREATE INDEX "Product_isPublished_idx" ON "Product"("isPublished");
