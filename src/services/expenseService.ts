import prisma from '@/prisma';
import { ExpenseType, RequestStatus } from '@prisma/client';

export default class ExpenseService {
  static async getAll() {
    return await prisma.expense.findMany({
      include: {
        receipts: {
          include: { media: true }
        }
      }
    });
  }

  static async getUnpaidCount(gammaGroupId?: string) {
    return await prisma.expense.count({
      where: {
        gammaGroupId,
        paidAt: null
      }
    });
  }

  static async getUnpaid(gammaGroupId?: string) {
    return await prisma.expense.findMany({
      where: {
        gammaGroupId,
        paidAt: null
      }
    });
  }

  static async getForSuperGroup(gammaSuperGroupId: string) {
    const expenses = await prisma.expense.findMany({
      where: {
        gammaSuperGroupId
      },
      include: {
        receipts: {
          include: { media: true }
        }
      }
    });
    return expenses;
  }

  static async getForGroup(gammaGroupId: string) {
    const expenses = await prisma.expense.findMany({
      where: {
        gammaGroupId
      },
      include: {
        receipts: {
          include: { media: true }
        }
      }
    });
    return expenses;
  }

  static async getById(id: number) {
    const expense = await prisma.expense.findUnique({
      where: {
        id
      },
      include: {
        receipts: {
          include: { media: true }
        }
      }
    });
    return expense;
  }

  static async getForUser(gammaUserId: string) {
    return await prisma.expense.findMany({
      where: {
        gammaSuperGroupId: null,
        gammaGroupId: null,
        gammaUserId
      },
      include: {
        receipts: {
          include: { media: true }
        }
      }
    });
  }

  static async getForUserWithGroups(
    gammaUserId: string,
    groups: string[],
    superGroups: string[]
  ) {
    return await prisma.expense.findMany({
      where: {
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
        receipts: {
          include: { media: true }
        }
      }
    });
  }

  static async createForGroup(
    gammaSuperGroupId: string,
    gammaGroupId: string,
    gammaUserId: string,
    amount: number,
    name: string,
    description: string,
    date: Date,
    receipts: number[],
    type: ExpenseType
  ) {
    const expense = await prisma.expense.create({
      data: {
        gammaUserId,
        gammaSuperGroupId,
        gammaGroupId,
        name,
        amount,
        description,
        occurredAt: date,
        receipts: {
          connect: receipts.map((r) => ({ id: r }))
        },
        type
      }
    });
    return expense;
  }

  static async editForGroup(
    id: number,
    gammaSuperGroupId: string,
    gammaGroupId: string,
    gammaUserId: string,
    amount: number,
    name: string,
    description: string,
    date: Date,
    receipts: number[],
    type: ExpenseType
  ) {
    const expense = await prisma.expense.update({
      where: {
        id
      },
      data: {
        gammaUserId,
        gammaSuperGroupId,
        gammaGroupId,
        name,
        amount,
        description,
        occurredAt: date,
        receipts: {
          set: receipts.map((r) => ({ id: r }))
        },
        type
      }
    });
    return expense;
  }

  static async createPersonal(
    gammaUserId: string,
    amount: number,
    name: string,
    description: string,
    date: Date,
    receipts: number[],
    type: ExpenseType
  ) {
    const expense = await prisma.expense.create({
      data: {
        gammaUserId,
        name,
        amount,
        description,
        occurredAt: date,
        receipts: {
          connect: receipts.map((r) => ({ id: r }))
        },
        type
      }
    });
    return expense;
  }

  static async editPersonal(
    id: number,
    gammaUserId: string,
    amount: number,
    name: string,
    description: string,
    receipts: number[],
    type: ExpenseType
  ) {
    const expense = await prisma.expense.update({
      where: {
        id
      },
      data: {
        gammaUserId,
        name,
        amount,
        description,
        receipts: {
          set: receipts.map((r) => ({ id: r }))
        },
        type
      }
    });
    return expense;
  }

  static async markAsPaid(id: number) {
    const expense = await prisma.expense.update({
      where: {
        id
      },
      data: {
        paidAt: new Date(),
        status: RequestStatus.APPROVED
      }
    });
    return expense;
  }

  static async markAsUnpaid(id: number) {
    const expense = await prisma.expense.update({
      where: {
        id
      },
      data: {
        paidAt: null
      }
    });
    return expense;
  }

  static async delete(id: number) {
    const expense = await prisma.expense.delete({
      where: {
        id
      }
    });
    return expense;
  }

  static async requestRevision(id: number) {
    const expense = await prisma.expense.update({
      where: {
        id
      },
      data: {
        status: RequestStatus.REJECTED
      }
    });
    return expense;
  }

  static async approve(id: number) {
    const expense = await prisma.expense.update({
      where: {
        id
      },
      data: {
        status: RequestStatus.APPROVED
      }
    });
    return expense;
  }
}
