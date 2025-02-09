import prisma from '@/prisma';
import GammaService from './gammaService';
import { InvoiceItemVat, Prisma, RequestStatus } from '@prisma/client';

export default class InvoiceService {
  static async getAll() {
    return await prisma.invoice.findMany({
      include: {
        items: true
      }
    });
  }

  static async getUnsentCount(gammaGroupId?: string) {
    return await prisma.invoice.count({
      where: {
        gammaGroupId,
        sentAt: null
      }
    });
  }

  static async getAllPrettified() {
    const expenses = await this.getAll();
    const prettified = await Promise.all(
      expenses.map(async (e) => ({
        ...e,
        user: (await GammaService.getUser(e.gammaUserId)).user
      }))
    );
    return prettified;
  }

  static async getForSuperGroup(gammaSuperGroupId: string) {
    const expenses = await prisma.invoice.findMany({
      where: {
        gammaSuperGroupId
      },
      include: {
        items: true
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
    const expense = await prisma.invoice.findUnique({
      where: {
        id
      },
      include: {
        items: true
      }
    });
    return expense;
  }

  static async getForGroup(gammaGroupId: string) {
    const expenses = await prisma.invoice.findMany({
      where: {
        gammaGroupId
      },
      include: {
        items: true
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
    return await prisma.invoice.findMany({
      where: {
        gammaSuperGroupId: null,
        gammaGroupId: null,
        gammaUserId
      },
      include: {
        items: true
      }
    });
  }

  static async createForGroup(
    gammaSuperGroupId: string,
    gammaGroupId: string,
    gammaUserId: string,
    name: string,
    customerName: string,
    description: string,
    items: Prisma.InvoiceItemCreateNestedManyWithoutInvoicesInput['create'],
    deliveryDate?: Date,
    customerReference?: string,
    customerReferenceCode?: string,
    customerSubscriptionNumber?: string,
    customerOrderReference?: string,
    customerContractNumber?: string
  ) {
    if (items === undefined || (Array.isArray(items) && items.length === 0)) {
      throw new Error('No items were provided');
    }

    if (this.calculateSumForItems(items) === 0) {
      throw new Error('Total sum of items is 0');
    }

    const expense = await prisma.invoice.create({
      data: {
        gammaUserId,
        gammaSuperGroupId,
        gammaGroupId,
        name,
        customerName,
        description,
        deliveryDate,
        customerReference,
        customerReferenceCode,
        customerSubscriptionNumber,
        customerOrderReference,
        customerContractNumber,
        inGroup: true,
        items: {
          create: items
        }
      }
    });
    return expense;
  }

  static async editForGroup(
    id: number,
    gammaSuperGroupId: string,
    gammaGroupId: string,
    gammaUserId: string,
    name: string,
    customerName: string,
    description: string,
    items: Prisma.InvoiceItemCreateNestedManyWithoutInvoicesInput['create'],
    deliveryDate?: Date,
    customerReference?: string,
    customerReferenceCode?: string,
    customerSubscriptionNumber?: string,
    customerOrderReference?: string,
    customerContractNumber?: string
  ) {
    if (items === undefined || (Array.isArray(items) && items.length === 0)) {
      throw new Error('No items were provided');
    }

    if (this.calculateSumForItems(items) === 0) {
      throw new Error('Total sum of items is 0');
    }

    const expense = await prisma.invoice.update({
      where: {
        id
      },
      data: {
        gammaUserId,
        gammaSuperGroupId,
        gammaGroupId,
        name,
        customerName,
        description,
        deliveryDate,
        customerReference,
        customerReferenceCode,
        customerSubscriptionNumber,
        customerOrderReference,
        customerContractNumber,
        items: {
          // IMPORTANT: Do not change the order of these operations
          // We want to delete all items and then create new ones
          deleteMany: {},
          create: items
        }
      }
    });
    return expense;
  }

  static async createPersonal(
    gammaUserId: string,
    name: string,
    customerName: string,
    description: string,
    items: Prisma.InvoiceItemCreateNestedManyWithoutInvoicesInput['create'],
    deliveryDate?: Date,
    customerReference?: string,
    customerReferenceCode?: string,
    customerSubscriptionNumber?: string,
    customerOrderReference?: string,
    customerContractNumber?: string
  ) {
    if (items === undefined || (Array.isArray(items) && items.length === 0)) {
      throw new Error('No items were provided');
    }

    if (this.calculateSumForItems(items) === 0) {
      throw new Error('Total sum of items is 0');
    }

    const expense = await prisma.invoice.create({
      data: {
        gammaUserId,
        name,
        customerName,
        description,
        deliveryDate,
        customerReference,
        customerReferenceCode,
        customerSubscriptionNumber,
        customerOrderReference,
        customerContractNumber,
        inGroup: true,
        items: {
          create: items
        }
      }
    });
    return expense;
  }

  static async editPersonal(
    id: number,
    gammaUserId: string,
    name: string,
    customerName: string,
    description: string,
    items: Prisma.InvoiceItemCreateNestedManyWithoutInvoicesInput['create'],
    deliveryDate?: Date,
    customerReference?: string,
    customerReferenceCode?: string,
    customerSubscriptionNumber?: string,
    customerOrderReference?: string,
    customerContractNumber?: string
  ) {
    if (items === undefined || (Array.isArray(items) && items.length === 0)) {
      throw new Error('No items were provided');
    }

    if (this.calculateSumForItems(items) === 0) {
      throw new Error('Total sum of items is 0');
    }

    const expense = await prisma.invoice.update({
      where: {
        id
      },
      data: {
        gammaUserId,
        name,
        customerName,
        description,
        deliveryDate,
        customerReference,
        customerReferenceCode,
        customerSubscriptionNumber,
        customerOrderReference,
        customerContractNumber,
        items: {
          // IMPORTANT: Do not change the order of these operations
          // We want to delete all items and then create new ones
          deleteMany: {},
          create: items
        }
      }
    });
    return expense;
  }

  static calculateSumForItems(
    items: Prisma.InvoiceItemCreateNestedManyWithoutInvoicesInput['create']
  ) {
    if (!items || (Array.isArray(items) && items.length === 0)) return 0;
    const calculateItemSum = (item: Prisma.InvoiceItemCreateInput) =>
      (item.amount ?? 0) *
      item.count *
      this.vatToDecimal(item.vat ?? InvoiceItemVat.VAT_0);
    return Array.isArray(items)
      ? items.reduce((acc, item) => acc + calculateItemSum(item), 0)
      : calculateItemSum(items);
  }

  static calculateVatSubtotalForItems(
    items: Prisma.InvoiceItemCreateNestedManyWithoutInvoicesInput['create']
  ) {
    if (!items || (Array.isArray(items) && items.length === 0)) return 0;
    const calculateItemSum = (item: Prisma.InvoiceItemCreateInput) =>
      (item.amount ?? 0) * item.count;
    return Array.isArray(items)
      ? items.reduce((acc, item) => acc + calculateItemSum(item), 0)
      : calculateItemSum(items);
  }

  private static vatToDecimal(vat: InvoiceItemVat) {
    switch (vat) {
      case InvoiceItemVat.VAT_6:
        return 1.06;
      case InvoiceItemVat.VAT_12:
        return 1.12;
      case InvoiceItemVat.VAT_25:
        return 1.25;
      case InvoiceItemVat.VAT_0:
      default:
        return 1;
    }
  }

  static async markAsSent(id: number) {
    const expense = await prisma.invoice.update({
      where: {
        id
      },
      data: {
        sentAt: new Date(),
        status: RequestStatus.APPROVED
      }
    });
    return expense;
  }

  static async markAsNotSent(id: number) {
    const expense = await prisma.invoice.update({
      where: {
        id
      },
      data: {
        sentAt: null
      }
    });
    return expense;
  }

  static async delete(id: number) {
    const expense = await prisma.invoice.delete({
      where: {
        id
      }
    });
    return expense;
  }

  static async requestRevision(id: number) {
    const expense = await prisma.invoice.update({
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
    const expense = await prisma.invoice.update({
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
