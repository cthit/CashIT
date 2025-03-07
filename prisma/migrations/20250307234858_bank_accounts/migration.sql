-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "GammaNameListEntry" ALTER COLUMN "cost" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "InvoiceItem" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "NameListEntry" ALTER COLUMN "cost" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ZettleSale" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" SERIAL NOT NULL,
    "goCardlessId" TEXT NOT NULL,
    "requisitionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "balanceBooked" DOUBLE PRECISION NOT NULL,
    "balanceAvailable" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "refreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gammaSuperGroupAccesses" TEXT[],

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoCardlessRequisition" (
    "id" SERIAL NOT NULL,
    "goCardlessId" TEXT NOT NULL,

    CONSTRAINT "GoCardlessRequisition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_goCardlessId_key" ON "BankAccount"("goCardlessId");

-- CreateIndex
CREATE UNIQUE INDEX "GoCardlessRequisition_goCardlessId_key" ON "GoCardlessRequisition"("goCardlessId");

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "GoCardlessRequisition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
