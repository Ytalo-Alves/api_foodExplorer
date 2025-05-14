/*
  Warnings:

  - The `createdAt` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "orders_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "dish_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
