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
  bankAccountId: number,
  gammaSuperGroupIds: string[]
) {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  return await BankAccountService.setAccess(bankAccountId, gammaSuperGroupIds);
}
