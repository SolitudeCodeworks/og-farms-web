/*
  Warnings:

  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FulfillmentType" AS ENUM ('DELIVERY', 'PICKUP');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'READY_FOR_PICKUP';
ALTER TYPE "OrderStatus" ADD VALUE 'PICKED_UP';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "fulfillmentType" "FulfillmentType" NOT NULL DEFAULT 'DELIVERY',
ADD COLUMN     "pickupStoreId" TEXT,
ALTER COLUMN "shippingCost" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "stock";

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'South Africa',
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "openingHours" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowsPickup" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreInventory" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockAlert" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreInventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- CreateIndex
CREATE INDEX "Store_isActive_idx" ON "Store"("isActive");

-- CreateIndex
CREATE INDEX "Store_allowsPickup_idx" ON "Store"("allowsPickup");

-- CreateIndex
CREATE INDEX "StoreInventory_storeId_idx" ON "StoreInventory"("storeId");

-- CreateIndex
CREATE INDEX "StoreInventory_productId_idx" ON "StoreInventory"("productId");

-- CreateIndex
CREATE INDEX "StoreInventory_quantity_idx" ON "StoreInventory"("quantity");

-- CreateIndex
CREATE UNIQUE INDEX "StoreInventory_storeId_productId_key" ON "StoreInventory"("storeId", "productId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pickupStoreId_fkey" FOREIGN KEY ("pickupStoreId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreInventory" ADD CONSTRAINT "StoreInventory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreInventory" ADD CONSTRAINT "StoreInventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
