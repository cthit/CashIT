'use server';

import NameListService from '@/services/nameListService';
import SessionService from '@/services/sessionService';
import { NameListType, Prisma } from '@prisma/client';

export async function createNameListForGroup(
  gammaGroupId: string,
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
    name,
    type,
    names,
    gammaNames,
    tracked,
    occurredAt
  );
}

export async function createPersonalNameList(
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
  name: string,
  type: NameListType,
  names: Prisma.NameListEntryCreateNestedManyWithoutNameListInput['create'],
  gammaNames: Prisma.GammaNameListEntryCreateNestedManyWithoutNameListInput['create'],
  tracked: boolean,
  occurredAt: Date
) {
  await NameListService.edit(
    id,
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
