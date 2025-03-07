import prisma from '@/prisma';
import { RequestStatus } from '@prisma/client';
import GotifyService from './gotifyService';

export default class MailNotificationService {
  static async notifyNewDocuments() {
    const expenses = await prisma.expense.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24)
        },
        paidAt: null,
        status: RequestStatus.PENDING
      }
    });

    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24)
        },
        sentAt: null,
        status: RequestStatus.PENDING
      }
    });

    if (expenses.length === 0 && invoices.length === 0) {
      return;
    }

    let message = 'You have new documents to review:\n\n';

    if (expenses.length > 0) {
      message +=
        expenses.length +
        (expenses.length === 1 ? ' expense:\n' : ' expenses:\n');
      message += expenses
        .map(
          (e) =>
            ` - ${e.name}: ${process.env.BASE_URL}/expenses/view?id=${e.id}`
        )
        .join('\n');
      message += '\n';
    }

    if (invoices.length > 0) {
      message +=
        expenses.length +
        (expenses.length === 1 ? ' invoice:\n' : ' invoices:\n');
      message += invoices
        .map(
          (i) =>
            ` - ${i.name}: ${process.env.BASE_URL}/invoices/view?id=${i.id}`
        )
        .join('\n');
    }

    await GotifyService.sendMessage(
      'kassor@chalmers.it',
      'noreply.cashit@chalmers.it',
      'New documents to review',
      message
    );
  }
}
