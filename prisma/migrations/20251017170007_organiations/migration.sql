/*
  Warnings:

  - The values [CARD] on the enum `ExpenseType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `organizationId` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `NameList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `ZettleSale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExpenseType_new" AS ENUM ('EXPENSE', 'INVOICE');
ALTER TABLE "Expense" ALTER COLUMN "type" TYPE "ExpenseType_new" USING ("type"::text::"ExpenseType_new");
ALTER TYPE "ExpenseType" RENAME TO "ExpenseType_old";
ALTER TYPE "ExpenseType_new" RENAME TO "ExpenseType";
DROP TYPE "ExpenseType_old";
COMMIT;

-- CreateTable (moved before AlterTable operations)
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ownerGammaSuperGroupId" TEXT NOT NULL,
    "primaryEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Create default organization only if there are existing records
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Expense") OR 
       EXISTS (SELECT 1 FROM "Invoice") OR 
       EXISTS (SELECT 1 FROM "NameList") OR 
       EXISTS (SELECT 1 FROM "ZettleSale") THEN
        INSERT INTO "Organization" (
            "name",
            "ownerGammaSuperGroupId",
            "primaryEmail",
            "createdAt",
            "updatedAt"
            )
        VALUES (
            'Default Organization',
            '45432d44-0de4-4ed0-88ce-8cdf31b72f73',
            'default@example.com',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
            );
    END IF;
END $$;

-- AlterTable for Expense
ALTER TABLE "Expense" ADD COLUMN "organizationId" INTEGER;
UPDATE "Expense" SET "organizationId" = (SELECT id FROM "Organization" WHERE name = 'Default Organization') WHERE "organizationId" IS NULL;
ALTER TABLE "Expense" ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable for Invoice
ALTER TABLE "Invoice" ADD COLUMN "organizationId" INTEGER;
UPDATE "Invoice" SET "organizationId" = (SELECT id FROM "Organization" WHERE name = 'Default Organization') WHERE "organizationId" IS NULL;
ALTER TABLE "Invoice" ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable for NameList
ALTER TABLE "NameList" ADD COLUMN "organizationId" INTEGER;
UPDATE "NameList" SET "organizationId" = (SELECT id FROM "Organization" WHERE name = 'Default Organization') WHERE "organizationId" IS NULL;
ALTER TABLE "NameList" ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable for ZettleSale
ALTER TABLE "ZettleSale" ADD COLUMN "organizationId" INTEGER;
UPDATE "ZettleSale" SET "organizationId" = (SELECT id FROM "Organization" WHERE name = 'Default Organization') WHERE "organizationId" IS NULL;
ALTER TABLE "ZettleSale" ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "NameList" ADD CONSTRAINT "NameList_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ZettleSale" ADD CONSTRAINT "ZettleSale_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
