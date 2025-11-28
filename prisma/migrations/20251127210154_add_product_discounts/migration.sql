-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discountEndDate" TIMESTAMP(3),
ADD COLUMN     "discountStartDate" TIMESTAMP(3),
ADD COLUMN     "discountType" "DiscountType",
ADD COLUMN     "discountValue" DOUBLE PRECISION;
