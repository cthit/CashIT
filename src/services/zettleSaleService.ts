import prisma from '@/prisma';

export default class ZettleSaleService {
  static async getAll(orgId: number) {
    return await prisma.zettleSale.findMany({
      where: {
        organizationId: orgId
      }
    });
  }

  static async getForSuperGroup(orgId: number, gammaSuperGroupId: string) {
    const expenses = await prisma.zettleSale.findMany({
      where: {
        gammaSuperGroupId,
        organizationId: orgId
      }
    });
    return expenses;
  }

  static async getForGroup(orgId: number, gammaGroupId: string) {
    const expenses = await prisma.zettleSale.findMany({
      where: {
        gammaGroupId,
        organizationId: orgId
      }
    });
    return expenses;
  }

  static async getForUserWithGroups(
    orgId: number,
    gammaUserId: string,
    groupIds: string[],
    superGroupIds: string[]
  ) {
    const expenses = await prisma.zettleSale.findMany({
      where: {
        organizationId: orgId,
        OR: [
          {
            gammaGroupId: {
              in: groupIds
            }
          },
          {
            gammaSuperGroupId: {
              in: superGroupIds
            }
          }
        ],
        gammaUserId
      }
    });
    return expenses;
  }

  static async getById(id: number) {
    const expense = await prisma.zettleSale.findUnique({
      where: {
        id
      }
    });
    return expense;
  }

  static async createForGroup(
    gammaSuperGroupId: string,
    gammaGroupId: string,
    gammaUserId: string,
    orgId: number,
    name: string,
    amount: number,
    saleDate: Date
  ) {
    return await prisma.zettleSale.create({
      data: {
        gammaSuperGroupId,
        gammaGroupId,
        gammaUserId,
        organizationId: orgId,
        name,
        description: '',
        amount,
        saleDate
      }
    });
  }

  static async edit(
    id: number,
    gammaSuperGroupId: string,
    gammaGroupId: string,
    name: string,
    amount: number,
    saleDate: Date
  ) {
    return await prisma.zettleSale.update({
      where: {
        id
      },
      data: {
        gammaSuperGroupId,
        gammaGroupId,
        name,
        amount,
        saleDate
      }
    });
  }

  static async delete(id: number) {
    return await prisma.zettleSale.delete({
      where: {
        id
      }
    });
  }
}
