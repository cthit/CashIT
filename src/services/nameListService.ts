import prisma from '@/prisma';
import GammaService from './gammaService';
import { NameListType, Prisma } from '@prisma/client';

export default class NameListService {
  static async getAll() {
    return await prisma.nameList.findMany({
      include: {
        names: true,
        gammaNames: true
      }
    });
  }

  static async getAllPrettified() {
    const names = await this.getAll();
    const prettified = await Promise.all(
      names.map(async (e) => ({
        ...e,
        user: (await GammaService.getUser(e.gammaUserId)).user
      }))
    );
    return prettified;
  }

  static async getForSuperGroup(gammaSuperGroupId: string) {
    const expenses = await prisma.nameList.findMany({
      where: {
        gammaSuperGroupId
      },
      include: {
        names: true,
        gammaNames: true
      }
    });
    return expenses;
  }

  static async getPrettifiedForSuperGroup(gammaSuperGroupId: string) {
    const expenses = await this.getForSuperGroup(gammaSuperGroupId);
    const prettifiedExpenses = await Promise.all(
      expenses.map(async (e) => ({
        ...e,
        user: (await GammaService.getUser(e.gammaUserId)).user
      }))
    );
    return prettifiedExpenses;
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

  static async getForGroup(gammaGroupId: string) {
    const expenses = await prisma.nameList.findMany({
      where: {
        gammaGroupId
      },
      include: {
        names: true,
        gammaNames: true
      }
    });
    return expenses;
  }

  static async getPrettifiedForGroup(gammaGroupId: string) {
    const expenses = await this.getForGroup(gammaGroupId);
    const prettifiedExpenses = await Promise.all(
      expenses.map(async (e) => ({
        ...e,
        user: (await GammaService.getUser(e.gammaUserId)).user
      }))
    );
    return prettifiedExpenses;
  }

  static async getForUser(gammaUserId: string) {
    return await prisma.nameList.findMany({
      where: {
        gammaSuperGroupId: null,
        gammaGroupId: null,
        gammaUserId
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
}
