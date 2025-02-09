'use server';

import SessionService from '@/services/sessionService';
import ZettleSaleService from '@/services/zettleSaleService';

export async function createZettleSale(
  gammaGroupId: string,
  name: string,
  amount: number,
  saleDate: Date
) {
  const gammaUserId = (await SessionService.getUser())?.id;
  if (!gammaUserId) {
    throw new Error('User is not logged in and cannot register a Zettle sale');
  }

  const group = (await SessionService.getGroups()).find(
    (g) => g.group.id === gammaGroupId
  )?.group;
  if (group === undefined) {
    throw new Error('Group does not exist');
  }

  await ZettleSaleService.createForGroup(
    group.superGroup.id,
    gammaGroupId,
    gammaUserId,
    name,
    amount,
    saleDate
  );
}

export async function editZettleSale(
  id: number,
  name: string,
  amount: number,
  saleDate: Date
) {
  await ZettleSaleService.edit(id, name, amount, saleDate);
}

export async function deleteZettleSale(id: number) {
  await ZettleSaleService.delete(id);
}
