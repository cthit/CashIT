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

  const [divisionTreasurer, localAdmin] = await Promise.all([
    SessionService.isDivisionTreasurer(),
    SessionService.isOrgLocalAdmin(existing.organizationId)
  ]);
  const isAdmin = divisionTreasurer || localAdmin;

  const userGroups = await SessionService.getGroups();
  const canEdit =
    isAdmin ||
    (existing.gammaGroupId !== null &&
      userGroups.some((g) => g.group.id === existing.gammaGroupId));

  if (!canEdit) {
    throw new Error('User does not have permission to edit this Zettle sale');
  }

  // Resolve group.
  // Admins may not be members, so fall back to existing superGroup
  const group = userGroups.find((g) => g.group.id === gammaGroupId)?.group;
  const gammaSuperGroupId =
    group?.superGroup.id ??
    (isAdmin ? existing.gammaSuperGroupId : undefined);

  if (!gammaSuperGroupId) {
    throw new Error('Group does not exist or user does not have access to it');
  }

  await ZettleSaleService.edit(
    id,
    gammaSuperGroupId,
    gammaGroupId,
    name,
    amount,
    saleDate
  );
}

export async function deleteZettleSale(id: number) {
  const existing = await ZettleSaleService.getById(id);
  if (existing === null) throw new Error('Zettle sale does not exist');

  const gammaUserId = (await SessionService.getUser())?.id;

  // Allow creator to delete their own sale
  if (gammaUserId && existing.gammaUserId === gammaUserId) {
    return ZettleSaleService.delete(id);
  }

  const [divisionTreasurer, localAdmin] = await Promise.all([
    SessionService.isDivisionTreasurer(),
    SessionService.isOrgLocalAdmin(existing.organizationId)
  ]);
  if (!divisionTreasurer && !localAdmin) {
    throw new Error('User does not have admin permission for this Zettle sale');
  }

  await ZettleSaleService.delete(id);
}
