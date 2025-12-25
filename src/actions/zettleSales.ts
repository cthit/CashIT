'use server';

import SessionService from '@/services/sessionService';
import ZettleSaleService from '@/services/zettleSaleService';

export async function createZettleSale(
  gammaGroupId: string,
  orgId: number,
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
    orgId,
    name,
    amount,
    saleDate
  );
}

export async function editZettleSale(
  id: number,
  gammaGroupId: string,
  name: string,
  amount: number,
  saleDate: Date
) {
  const gammaUserId = (await SessionService.getUser())?.id;
  if (!gammaUserId) {
    throw new Error('User is not logged in and cannot edit a Zettle sale');
  }

  const existing = await ZettleSaleService.getById(id);
  if (existing === null) {
    throw new Error('Zettle sale does not exist');
  }

  // Check if user has permission to edit this Zettle sale
  // User can edit if they belong to the group that owns the sale
  const userGroups = await SessionService.getGroups();
  const canEdit =
    existing.gammaGroupId !== null &&
    userGroups.some((g) => g.group.id === existing.gammaGroupId);

  if (!canEdit) {
    throw new Error('User does not have permission to edit this Zettle sale');
  }

  // Validate the new group
  const group = userGroups.find((g) => g.group.id === gammaGroupId)?.group;
  if (group === undefined) {
    throw new Error('Group does not exist or user does not have access to it');
  }

  console.log('Editing Zettle sale with ID:', id, 'and gammaGroupId:', gammaGroupId);

  await ZettleSaleService.edit(
    id,
    group.superGroup.id,
    gammaGroupId,
    name,
    amount,
    saleDate
  );
}

export async function deleteZettleSale(id: number) {
  await ZettleSaleService.delete(id);
}
