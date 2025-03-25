'use server';

import GoCardlessService from '@/services/goCardlessService';
import SessionService from '@/services/sessionService';

export async function registerRequisition(id: string) {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  return await GoCardlessService.registerRequisition(id);
}

export async function registerBankAccount(id: string, requisitionId: string) {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  return await GoCardlessService.registerBankAccount(id, requisitionId);
}
