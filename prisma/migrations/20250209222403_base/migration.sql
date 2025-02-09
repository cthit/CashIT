-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'PENDING_REVISED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('EXPENSE', 'INVOICE', 'CARD');

-- CreateEnum
CREATE TYPE "InvoiceItemVat" AS ENUM ('VAT_0', 'VAT_6', 'VAT_12', 'VAT_25');

-- CreateEnum
CREATE TYPE "NameListType" AS ENUM ('EVENT', 'WORK_FOOD', 'TEAMBUILDING', 'PROFILE_CLOTHING');

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "gammaSuperGroupId" TEXT,
    "gammaGroupId" TEXT,
    "gammaUserId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "occurredAt" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "type" "ExpenseType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "gammaSuperGroupId" TEXT,
    "gammaGroupId" TEXT,
    "gammaUserId" TEXT NOT NULL,
    "inGroup" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "description" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "customerReference" TEXT,
    "customerReferenceCode" TEXT,
    "customerSubscriptionNumber" TEXT,
    "customerOrderReference" TEXT,
    "customerContractNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "vat" "InvoiceItemVat" NOT NULL DEFAULT 'VAT_0',

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NameList" (
    "id" SERIAL NOT NULL,
    "gammaSuperGroupId" TEXT,
    "gammaGroupId" TEXT,
    "gammaUserId" TEXT NOT NULL,
    "type" "NameListType" NOT NULL,
    "tracked" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "occurredAt" DATE NOT NULL,

    CONSTRAINT "NameList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GammaNameListEntry" (
    "nameListId" INTEGER NOT NULL,
    "gammaUserId" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,

    CONSTRAINT "GammaNameListEntry_pkey" PRIMARY KEY ("gammaUserId","nameListId")
);

-- CreateTable
CREATE TABLE "NameListEntry" (
    "id" SERIAL NOT NULL,
    "nameListId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,

    CONSTRAINT "NameListEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "sha256" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("sha256")
);

-- CreateTable
CREATE TABLE "NamedMedia" (
    "id" SERIAL NOT NULL,
    "sha256" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "NamedMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZettleSale" (
    "id" SERIAL NOT NULL,
    "gammaSuperGroupId" TEXT NOT NULL,
    "gammaGroupId" TEXT NOT NULL,
    "gammaUserId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "saleDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZettleSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExpenseToNamedMedia" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_InvoiceToInvoiceItem" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "NameListEntry_nameListId_name_key" ON "NameListEntry"("nameListId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "NamedMedia_sha256_name_key" ON "NamedMedia"("sha256", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ZettleSale_gammaGroupId_saleDate_key" ON "ZettleSale"("gammaGroupId", "saleDate");

-- CreateIndex
CREATE UNIQUE INDEX "_ExpenseToNamedMedia_AB_unique" ON "_ExpenseToNamedMedia"("A", "B");

-- CreateIndex
CREATE INDEX "_ExpenseToNamedMedia_B_index" ON "_ExpenseToNamedMedia"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_InvoiceToInvoiceItem_AB_unique" ON "_InvoiceToInvoiceItem"("A", "B");

-- CreateIndex
CREATE INDEX "_InvoiceToInvoiceItem_B_index" ON "_InvoiceToInvoiceItem"("B");

-- AddForeignKey
ALTER TABLE "GammaNameListEntry" ADD CONSTRAINT "GammaNameListEntry_nameListId_fkey" FOREIGN KEY ("nameListId") REFERENCES "NameList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NameListEntry" ADD CONSTRAINT "NameListEntry_nameListId_fkey" FOREIGN KEY ("nameListId") REFERENCES "NameList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NamedMedia" ADD CONSTRAINT "NamedMedia_sha256_fkey" FOREIGN KEY ("sha256") REFERENCES "Media"("sha256") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpenseToNamedMedia" ADD CONSTRAINT "_ExpenseToNamedMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpenseToNamedMedia" ADD CONSTRAINT "_ExpenseToNamedMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "NamedMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvoiceToInvoiceItem" ADD CONSTRAINT "_InvoiceToInvoiceItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvoiceToInvoiceItem" ADD CONSTRAINT "_InvoiceToInvoiceItem_B_fkey" FOREIGN KEY ("B") REFERENCES "InvoiceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
