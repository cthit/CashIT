import prisma from '@/prisma';

export default class ZettleSaleService {
  static async getAll() {
    return await prisma.zettleSale.findMany();
  }

  static async getForSuperGroup(gammaSuperGroupId: string) {
    const expenses = await prisma.zettleSale.findMany({
      where: {
        gammaSuperGroupId
      }
    });
    return expenses;
  }

  static async getForGroup(gammaGroupId: string) {
    const expenses = await prisma.zettleSale.findMany({
      where: {
        gammaGroupId
      }
    });
    return expenses;
  }

  static async getForUserWithGroups(
    gammaUserId: string,
    groupIds: string[],
    superGroupIds: string[]
  ) {
    const expenses = await prisma.zettleSale.findMany({
      where: {
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
    name: string,
    amount: number,
    saleDate: Date
  ) {
    return await prisma.zettleSale.create({
      data: {
        gammaSuperGroupId,
        gammaGroupId,
        gammaUserId,
        name,
        description: '',
        amount,
        saleDate
      }
    });
  }

  static async edit(id: number, name: string, amount: number, saleDate: Date) {
    return await prisma.zettleSale.update({
      where: {
        id
      },
      data: {
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
