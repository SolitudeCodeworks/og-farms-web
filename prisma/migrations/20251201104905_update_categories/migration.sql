/*
  Warnings:

  - The values [PAPERS,BONGS] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('FLOWER', 'PRE_ROLLS', 'EDIBLES', 'CONCENTRATES', 'VAPES', 'ACCESSORIES', 'ROLLING_PAPERS', 'BONGS_AND_PIPES', 'GRINDERS', 'OTHER');
ALTER TABLE "Product" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "public"."Category_old";
COMMIT;
