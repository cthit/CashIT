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

export async function recreateRequisition(id: string) {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  const requisitions = (await GoCardlessService.getRequisitions()).results;
  const requisition = requisitions.find((r) => r.id === id);
  if (!requisition) {
    throw new Error(`Requisition with ID ${id} not found`);
  }
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error('BASE_URL is not defined');
  }

  const refId =
    Date.now().toString(36) + Math.random().toString(36).substring(2, 15);

  return await GoCardlessService.createRequisition({
    redirect: `${baseUrl}/bank-accounts/finalize-reconnect`,
    institution_id: requisition.institution_id,
    reference: `cashit-${refId}`
  });
}
