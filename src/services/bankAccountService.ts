import prisma from '@/prisma';
import GoCardlessService from './goCardlessService';

export default class BankAccountService {
  static async getAll() {
    return await prisma.bankAccount.findMany();
  }

  static async refreshAll() {
    const accounts = await this.getAll();

    await Promise.all(
      accounts.map(async (account) => {
        await this.refresh(account.id);
      })
    );
  }

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

    await prisma.bankAccount.update({
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
        refreshedAt: new Date()
      }
    });
  }
}
