-- CreateTable
CREATE TABLE "BankAccountTransaction" (
    "id" SERIAL NOT NULL,
    "goCardlessId" TEXT,
    "accountId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT,
    "reference" TEXT,
    "valueDate" DATE,
    "bookingDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankAccountTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankAccountTransaction_goCardlessId_key" ON "BankAccountTransaction"("goCardlessId");

-- AddForeignKey
ALTER TABLE "BankAccountTransaction" ADD CONSTRAINT "BankAccountTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
