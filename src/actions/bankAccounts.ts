'use server';

import BankAccountService from '@/services/bankAccountService';
import SessionService from '@/services/sessionService';

export async function refreshAllBankAccounts() {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  return await BankAccountService.refreshAll();
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
