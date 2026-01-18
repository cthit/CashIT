import prisma from '@/prisma';
import { NameListType, Prisma } from '@prisma/client';
import i18nService from './i18nService';

export default class NameListService {
  static async getAll(orgId: number) {
    return await prisma.nameList.findMany({
      where: {
        organizationId: orgId
      },
      include: {
        names: true,
        gammaNames: true
      }
    });
  }

  static async getForSuperGroup(orgId: number, gammaSuperGroupId: string) {
    const expenses = await prisma.nameList.findMany({
      where: {
        gammaSuperGroupId,
        organizationId: orgId
      },
      include: {
        names: true,
        gammaNames: true
      }
    });
    return expenses;
  }

  static async getById(id: number) {
    const expense = await prisma.nameList.findUnique({
      where: {
        id
      },
      include: {
        names: true,
        gammaNames: true
      }
    });
    return expense;
  }

  static async getForGroup(orgId: number, gammaGroupId: string) {
    const expenses = await prisma.nameList.findMany({
      where: {
        gammaGroupId,
        organizationId: orgId
      },
      include: {
        names: true,
        gammaNames: true
      }
    });
    return expenses;
  }

  static async getForUser(orgId: number, gammaUserId: string) {
    return await prisma.nameList.findMany({
      where: {
        gammaSuperGroupId: null,
        gammaGroupId: null,
        gammaUserId,
        organizationId: orgId
      },
      include: {
        names: true,
        gammaNames: true
      }
    });
  }

  static async getForUserWithGroups(
    orgId: number,
    gammaUserId: string,
    groups: string[],
    superGroups: string[]
  ) {
    return await prisma.nameList.findMany({
      where: {
        organizationId: orgId,
        OR: [
          {
            gammaUserId
          },
          {
            gammaSuperGroupId: { in: superGroups }
          },
          {
            gammaGroupId: { in: groups }
          }
        ]
      },
      include: {
        names: true,
        gammaNames: true
      }
    });
  }

  static async createForGroup(
    gammaSuperGroupId: string,
    gammaGroupId: string,
    gammaUserId: string,
    orgId: number,
    name: string,
    type: NameListType,
    names: Prisma.NameListEntryCreateNestedManyWithoutNameListInput['create'],
    gammaNames: Prisma.GammaNameListEntryCreateNestedManyWithoutNameListInput['create'],
    tracked: boolean,
    occurredAt: Date
  ) {
    if (
      (names === undefined || (Array.isArray(names) && names.length === 0)) &&
      (gammaNames === undefined ||
        (Array.isArray(gammaNames) && gammaNames.length === 0))
    ) {
      throw new Error('No names were provided');
    }

    const expense = await prisma.nameList.create({
      data: {
        gammaSuperGroupId,
        gammaGroupId,
        gammaUserId,
        organizationId: orgId,
        name,
        type,
        names: {
          create: names
        },
        gammaNames: {
          create: gammaNames
        },
        tracked,
        occurredAt
      }
    });
    return expense;
  }

  static async createPersonal(
    gammaUserId: string,
    orgId: number,
    name: string,
    type: NameListType,
    names: Prisma.NameListEntryCreateNestedManyWithoutNameListInput['create'],
    gammaNames: Prisma.GammaNameListEntryCreateNestedManyWithoutNameListInput['create'],
    tracked: boolean,
    occurredAt: Date
  ) {
    if (
      (names === undefined || (Array.isArray(names) && names.length === 0)) &&
      (gammaNames === undefined ||
        (Array.isArray(gammaNames) && gammaNames.length === 0))
    ) {
      throw new Error('No names were provided');
    }

    const expense = await prisma.nameList.create({
      data: {
        gammaUserId,
        organizationId: orgId,
        name,
        type,
        names: {
          create: names
        },
        gammaNames: {
          create: gammaNames
        },
        tracked,
        occurredAt
      }
    });
    return expense;
  }

  static async edit(
    id: number,
    gammaGroupId: string | null,
    gammaSuperGroupId: string | null,
    name: string,
    type: NameListType,
    names: Prisma.NameListEntryCreateNestedManyWithoutNameListInput['create'],
    gammaNames: Prisma.GammaNameListEntryCreateNestedManyWithoutNameListInput['create'],
    tracked: boolean,
    occurredAt: Date
  ) {
    if (
      (names === undefined || (Array.isArray(names) && names.length === 0)) &&
      (gammaNames === undefined ||
        (Array.isArray(gammaNames) && gammaNames.length === 0))
    ) {
      throw new Error('No names were provided');
    }

    const expense = await prisma.nameList.update({
      where: {
        id
      },
      data: {
        name,
        gammaGroupId,
        gammaSuperGroupId,
        type,
        names: {
          // IMPORTANT: Do not change the order of these operations
          // We want to delete all items and then create new ones
          deleteMany: {},
          create: names
        },
        gammaNames: {
          // IMPORTANT: Do not change the order of these operations
          // We want to delete all items and then create new ones
          deleteMany: {},
          create: gammaNames
        },
        tracked,
        occurredAt
      }
    });
    return expense;
  }

  static async delete(id: number) {
    await prisma.nameList.delete({
      where: {
        id
      }
    });
  }

  static prettifyType(type: NameListType, locale: string) {
    const l = i18nService.getLocale(locale);

    switch (type) {
      case 'EVENT':
        return l.nameLists.types.event;
      case 'PROFILE_CLOTHING':
        return l.nameLists.types.profileClothing;
      case 'TEAMBUILDING':
        return l.nameLists.types.teambuilding;
      case 'WORK_FOOD':
        return l.nameLists.types.workFood;
    }
  }
}
