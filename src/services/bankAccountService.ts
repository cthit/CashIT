import prisma from '@/prisma';
import GoCardlessService from './goCardlessService';
import { Prisma } from '@prisma/client';

export default class BankAccountService {
  /**
   * Gets all locally registered bank accounts
   * @param groups Gamma super groups to filter by. No filtering applied if not provided
   * @returns List of bank accounts
   */
  static async getAll(groups?: string[]) {
    return await prisma.bankAccount.findMany({
      where: groups
        ? {
            gammaSuperGroupAccesses: {
              hasSome: groups
            }
          }
        : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Gets locally registered bank account by GoCardless ID
   * @param goCardlessId ID of the GoCardless bank account
   * @returns Locally registered bank account or null if not found
   */
  static async getByGoCardlessId(goCardlessId: string) {
    return await prisma.bankAccount.findUnique({
      where: {
        goCardlessId
      },
      include: {
        transactions: {
          orderBy: [
            { bookingDate: { sort: 'desc', nulls: 'first' } },
            { valueDate: 'desc' }
          ]
        }
      }
    });
  }

  /**
   * Refreshes all locally registered bank accounts from the GoCardless API and updates their information in the database
   */
  static async refreshAll() {
    const accounts = await BankAccountService.getAll();

    await GoCardlessService.checkToken();

    await Promise.all(
      accounts.map(async (account) => {
        await BankAccountService.refresh(account.id);
      })
    );
  }

  /**
   * Refreshes a locally registered bank account from the GoCardless API and updates its information in the database
   * @param id ID of the bank account
   */
  static async refresh(id: number) {
    const account = await prisma.bankAccount.findUnique({
      where: {
        id
      }
    });

    if (account === null) {
      throw new Error('Bank account does not exist');
    }

    const balance = await GoCardlessService.getBankAccountBalance(
      account.goCardlessId
    );
    const available = balance.find((b) => b.balanceType === 'interimAvailable');
    const booked = balance.find((b) => b.balanceType === 'interimBooked');

    if (available === undefined || booked === undefined) {
      throw new Error('Balance data is incomplete');
    }

    const transactions = await GoCardlessService.getBankAccountTransactions(
      account.goCardlessId
    );

    const transactionsData: Prisma.BankAccountTransactionCreateWithoutAccountInput[] =
      transactions.booked.concat(transactions.pending).map((transaction) => ({
        goCardlessId: transaction.internalTransactionId,
        amount: +transaction.transactionAmount.amount,
        bookingDate: transaction.bookingDate
          ? new Date(transaction.bookingDate)
          : null,
        valueDate: transaction.valueDate
          ? new Date(transaction.valueDate)
          : null,
        reference: transaction.remittanceInformationUnstructured,
        type: transaction.remittanceInformationStructured
      }));

    await prisma.bankAccount
      .update({
        where: {
          id
        },
        data: {
          balanceAvailable:
            available !== undefined
              ? +available?.balanceAmount.amount
              : undefined,
          balanceBooked:
            booked !== undefined ? +booked?.balanceAmount.amount : undefined,
          refreshedAt: new Date(),
          transactions: {
            // IMPORTANT: Do not change the order of these operations
            // We want to delete all items and then create new ones
            deleteMany: {},
            create: transactionsData
          }
        }
      })
      .catch((e) => {
        console.error('Error updating bank account:', e);
      });
  }

  /**
   * Sets Gamma super group access for a locally stored GoCardless bank account
   * @param goCardlessId ID of the GoCardless bank account
   * @param groups Gamma super groups to allow access for
   * @returns Updated bank account
   */
  static async setAccess(goCardlessId: string, groups: string[]) {
    return await prisma.bankAccount.update({
      where: {
        goCardlessId
      },
      data: {
        gammaSuperGroupAccesses: groups
      }
    });
  }

  /**
   * Removes a GoCardless bank account from local storage
   * @param goCardlessId ID of the GoCardless bank account
   * @returns Deleted bank account
   */
  static async remove(goCardlessId: string) {
    return await prisma.bankAccount.delete({
      where: {
        goCardlessId
      }
    });
  }
}
