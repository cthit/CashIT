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

  // Check if user has permission to edit this name list
  // User can edit if:
  // 1. They created the name list (for personal name lists)
  // 2. They belong to the group that owns the name list (for group name lists)
  const userGroups = await SessionService.getGroups();
  const canEdit =
    existing.gammaUserId === gammaUserId || // User created it
    (existing.gammaGroupId !== null &&
      userGroups.some((g) => g.group.id === existing.gammaGroupId)); // User belongs to the group

  if (!canEdit) {
    throw new Error('User does not have permission to edit this name list');
  }

  console.log('Editing name list with ID:', id, 'and gammaGroupId:', gammaGroupId);

  // Validate the new group if specified
  let group = null;
  if (gammaGroupId !== null) {
    group = userGroups.find((g) => g.group.id === gammaGroupId)?.group;
    if (group === undefined) {
      throw new Error('Group does not exist or user does not have access to it');
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
  await NameListService.delete(id);
}
