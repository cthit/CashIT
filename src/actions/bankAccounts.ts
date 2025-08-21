'use server';

import BankAccountService from '@/services/bankAccountService';
import GoCardlessService from '@/services/goCardlessService';
import SessionService from '@/services/sessionService';
import prisma from '@/prisma';
import cache from '@/cache';

export async function refreshAllBankAccounts() {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  return await BankAccountService.refreshAll();
}

export async function refreshBankAccount(accountId: number) {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  return await BankAccountService.refresh(accountId);
}

export async function setBankAccountAccess(
  goCardlessId: string,
  gammaSuperGroupIds: string[]
) {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  return await BankAccountService.setAccess(goCardlessId, gammaSuperGroupIds);
}

export async function deleteBankAccount(goCardlessId: string) {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  return await BankAccountService.remove(goCardlessId);
}

export async function deleteRequisition(requisitionId: string) {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  // First delete all bank accounts associated with this requisition
  const requisition = await prisma.goCardlessRequisition.findUnique({
    where: { goCardlessId: requisitionId },
    include: { bankAccounts: true }
  });

  if (!requisition) {
    throw new Error('Requisition not found');
  }

  // Delete all associated bank accounts first
  for (const account of requisition.bankAccounts) {
    await BankAccountService.remove(account.goCardlessId);
  }

  // Then delete the requisition
  await prisma.goCardlessRequisition.delete({
    where: { goCardlessId: requisitionId }
  });
}

/**
 * Gets cached account details or fetches from GoCardless API if not cached
 */
export async function getCachedAccountDetails(accountId: string) {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  const cacheKey = `gocardless-account-${accountId}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached as Awaited<ReturnType<typeof GoCardlessService.getBankAccountDetails>>;
  }

  const details = await GoCardlessService.getBankAccountDetails(accountId);
  // Cache for 12 hours
  cache.set(cacheKey, details, 43200);

  return details;
}

/**
 * Registers a new bank account from a GoCardless account
 */
export async function registerNewBankAccount(
  accountId: string,
  requisitionId: string,
  customName?: string
) {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  const accountDetails = await getCachedAccountDetails(accountId);
  const account = accountDetails.account;

  // Check if account with this IBAN already exists
  const existingAccount = await prisma.bankAccount.findFirst({
    where: { iban: account.iban }
  });

  if (existingAccount) {
    throw new Error('An account with this IBAN already exists');
  }

  await prisma.bankAccount.create({
    data: {
      name: customName || account.name || account.product,
      goCardlessId: accountId,
      iban: account.iban,
      balanceAvailable: 0,
      balanceBooked: 0,
      requisition: {
        connect: {
          goCardlessId: requisitionId
        }
      }
    }
  });
}

/**
 * Merges an account by updating an existing account's requisition ID
 */
export async function mergeWithExistingAccount(
  newAccountId: string,
  existingAccountId: number,
  newRequisitionId: string
) {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  // Find the requisition to connect to
  const requisition = await prisma.goCardlessRequisition.findUnique({
    where: { goCardlessId: newRequisitionId }
  });

  if (!requisition) {
    throw new Error('Requisition not found');
  }

  // Update the existing account with the new GoCardless ID and requisition
  await prisma.bankAccount.update({
    where: { id: existingAccountId },
    data: {
      goCardlessId: newAccountId,
      requisitionId: requisition.id
    }
  });
}

/**
 * Gets all existing bank accounts for selection in merge operation
 */
export async function getExistingBankAccounts() {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  return await prisma.bankAccount.findMany({
    select: {
      id: true,
      name: true,
      iban: true,
      goCardlessId: true
    },
    orderBy: { name: 'asc' }
  });
}
