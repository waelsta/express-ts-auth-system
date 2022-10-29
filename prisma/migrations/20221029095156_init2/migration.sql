-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "is_client" DROP NOT NULL,
ALTER COLUMN "is_client" SET DEFAULT false;
