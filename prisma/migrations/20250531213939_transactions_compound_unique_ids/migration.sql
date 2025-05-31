/*
  Warnings:

  - A unique constraint covering the columns `[goCardlessId,accountId]` on the table `BankAccountTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BankAccountTransaction_goCardlessId_key";

-- CreateIndex
CREATE UNIQUE INDEX "BankAccountTransaction_goCardlessId_accountId_key" ON "BankAccountTransaction"("goCardlessId", "accountId");
