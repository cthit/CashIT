'use server';

import NameListService from '@/services/nameListService';
import SessionService from '@/services/sessionService';
import { NameListType, Prisma } from '@prisma/client';

export async function createNameListForGroup(
  gammaGroupId: string,
  orgId: number,
  name: string,
  type: NameListType,
  names: Prisma.NameListEntryCreateNestedManyWithoutNameListInput['create'],
  gammaNames: Prisma.GammaNameListEntryCreateNestedManyWithoutNameListInput['create'],
  tracked: boolean,
  occurredAt: Date
) {
  const gammaUserId = (await SessionService.getUser())?.id;
  if (!gammaUserId) {
    throw new Error('User is not logged in and cannot create a name list');
  }

  const group = (await SessionService.getGroups()).find(
    (g) => g.group.id === gammaGroupId
  )?.group;
  if (group === undefined) {
    throw new Error('Group does not exist');
  }

  await NameListService.createForGroup(
    group.superGroup.id,
    gammaGroupId,
    gammaUserId,
    orgId,
    name,
    type,
    names,
    gammaNames,
    tracked,
    occurredAt
  );
}

export async function createPersonalNameList(
  orgId: number,
  name: string,
  type: NameListType,
  names: Prisma.NameListEntryCreateNestedManyWithoutNameListInput['create'],
  gammaNames: Prisma.GammaNameListEntryCreateNestedManyWithoutNameListInput['create'],
  tracked: boolean,
  occurredAt: Date
) {
  const gammaUserId = (await SessionService.getUser())?.id;
  if (!gammaUserId) {
    throw new Error('User is not logged in and cannot create a name list');
  }

  await NameListService.createPersonal(
    gammaUserId,
    orgId,
    name,
    type,
    names,
    gammaNames,
    tracked,
    occurredAt
  );
}

export async function editNameList(
  id: number,
  gammaGroupId: string | null,
  name: string,
  type: NameListType,
  names: Prisma.NameListEntryCreateNestedManyWithoutNameListInput['create'],
  gammaNames: Prisma.GammaNameListEntryCreateNestedManyWithoutNameListInput['create'],
  tracked: boolean,
  occurredAt: Date
) {
  const gammaUserId = (await SessionService.getUser())?.id;
  if (!gammaUserId) {
    throw new Error('User is not logged in and cannot edit a name list');
  }

  const existing = await NameListService.getById(id);
  if (existing === null) {
    throw new Error('Name list does not exist');
  }

  const [divisionTreasurer, localAdmin] = await Promise.all([
    SessionService.isDivisionTreasurer(),
    SessionService.isOrgLocalAdmin(existing.organizationId)
  ]);
  const isAdmin = divisionTreasurer || localAdmin;

  const userGroups = await SessionService.getGroups();
  const canEdit =
    isAdmin ||
    existing.gammaUserId === gammaUserId ||
    (existing.gammaGroupId !== null &&
      userGroups.some((g) => g.group.id === existing.gammaGroupId));

  if (!canEdit) {
    throw new Error('User does not have permission to edit this name list');
  }

  // Validate the new group if specified
  // Admins keep the existing group when they don't belong to it
  let group = null;
  if (gammaGroupId !== null) {
    group = userGroups.find((g) => g.group.id === gammaGroupId)?.group ?? null;
    if (group === null && !isAdmin) {
      throw new Error('Group does not exist or user does not have access to it');
    }
    if (group === null && isAdmin) {
      group = existing.gammaGroupId === gammaGroupId
        ? { id: gammaGroupId, superGroup: { id: existing.gammaSuperGroupId! } } as any
        : null;
    }
  }

  await NameListService.edit(
    id,
    gammaGroupId,
    group ? group.superGroup.id : null,
    name,
    type,
    names,
    gammaNames,
    tracked,
    occurredAt
  );
}

export async function deleteNameList(id: number) {
  const existing = await NameListService.getById(id);
  if (existing === null) throw new Error('Name list does not exist');

  const gammaUserId = (await SessionService.getUser())?.id;

  // Allow creator to delete their own name list
  if (gammaUserId && existing.gammaUserId === gammaUserId) {
    return NameListService.delete(id);
  }

  const [divisionTreasurer, localAdmin] = await Promise.all([
    SessionService.isDivisionTreasurer(),
    SessionService.isOrgLocalAdmin(existing.organizationId)
  ]);
  if (!divisionTreasurer && !localAdmin) {
    throw new Error('User does not have admin permission for this name list');
  }

  await NameListService.delete(id);
}
