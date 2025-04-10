-- AlterTable
ALTER TABLE "_ExpenseToNamedMedia" ADD CONSTRAINT "_ExpenseToNamedMedia_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ExpenseToNamedMedia_AB_unique";

-- AlterTable
ALTER TABLE "_InvoiceToInvoiceItem" ADD CONSTRAINT "_InvoiceToInvoiceItem_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_InvoiceToInvoiceItem_AB_unique";
