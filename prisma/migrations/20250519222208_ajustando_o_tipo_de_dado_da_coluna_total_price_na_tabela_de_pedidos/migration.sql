/*
  Warnings:

  - Changed the type of `total_price` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "total_price",
ADD COLUMN     "total_price" INTEGER NOT NULL;
