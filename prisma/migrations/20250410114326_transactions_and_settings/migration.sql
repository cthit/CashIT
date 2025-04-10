-- CreateTable
CREATE TABLE "BankAccountTransaction" (
    "goCardlessId" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "booked" BOOLEAN NOT NULL DEFAULT false,
    "occurredAt" DATE NOT NULL,

    CONSTRAINT "BankAccountTransaction_pkey" PRIMARY KEY ("goCardlessId")
);

-- CreateTable
CREATE TABLE "User" (
    "gammaUserId" TEXT NOT NULL,
    "forwardEmail" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("gammaUserId")
);

-- AddForeignKey
ALTER TABLE "BankAccountTransaction" ADD CONSTRAINT "BankAccountTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
