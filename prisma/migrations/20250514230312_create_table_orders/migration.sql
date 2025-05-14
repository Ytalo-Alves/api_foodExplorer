-- DropForeignKey
ALTER TABLE "ingredients" DROP CONSTRAINT "ingredients_dish_id_fkey";

-- AlterTable
ALTER TABLE "ingredients" ALTER COLUMN "dish_id" SET DEFAULT 'CASCADE';

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total_price" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
