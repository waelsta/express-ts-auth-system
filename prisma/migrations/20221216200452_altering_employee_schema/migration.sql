/*
  Warnings:

  - You are about to drop the column `coordinates` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `cv_url` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "coordinates",
DROP COLUMN "cv_url",
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "long" DOUBLE PRECISION;
