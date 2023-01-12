/*
  Warnings:

  - You are about to drop the column `service_id` on the `Employee` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_service_id_fkey";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "service_id",
ADD COLUMN     "profession" TEXT;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_profession_fkey" FOREIGN KEY ("profession") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
