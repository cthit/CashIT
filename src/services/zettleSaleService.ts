import prisma from '@/prisma';
import GammaService from './gammaService';

export default class ZettleSaleService {
  static async getAll() {
    return await prisma.zettleSale.findMany();
  }

  static async getAllPrettified() {
    const expenses = await this.getAll();
    const prettifiedExpenses = await Promise.all(
      expenses.map(async (e) => ({
        ...e,
        user: (await GammaService.getUser(e.gammaUserId)).user
      }))
    );
    return prettifiedExpenses;
  }

  static async getForSuperGroup(gammaSuperGroupId: string) {
    const expenses = await prisma.zettleSale.findMany({
      where: {
        gammaSuperGroupId
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

  static async getForGroup(gammaGroupId: string) {
    const expenses = await prisma.zettleSale.findMany({
      where: {
        gammaGroupId
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
