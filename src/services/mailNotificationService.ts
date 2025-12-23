import prisma from '@/prisma';
import { RequestStatus } from '@prisma/client';
import GotifyService from './gotifyService';
import GammaService from './gammaService';

export default class MailNotificationService {
  static async notifyNewDocuments() {
    const groups = (await GammaService.getAllSuperGroups()).filter((sg) =>
      ['FUNCTIONARIES', 'ALUMNI'].includes(sg.superGroup.type)
    );
    const groupEmailMap = new Map<string, string>();
    for (const group of groups) {
      groupEmailMap.set(
        group.superGroup.id,
        `kassor.${group.superGroup.name}@chalmers.it`
      );
    }

    console.log('Group email map:', groupEmailMap);

    const expenses = await prisma.expense.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        paidAt: null,
        status: RequestStatus.PENDING
      }
    });

    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        sentAt: null,
        status: RequestStatus.PENDING
      }
    });

    if (expenses.length === 0 && invoices.length === 0) return;

    const documentsByEmail = new Map<
      string,
      { expenses: typeof expenses; invoices: typeof invoices }
    >();

    const getEmail = (groupId: string | null) =>
      groupId && groupEmailMap.has(groupId)
        ? groupEmailMap.get(groupId)!
        : 'kassor.styrit@chalmers.it';

    for (const expense of expenses) {
      const email = getEmail(expense.gammaSuperGroupId);
      console.log(
        `Expense with group ${expense.gammaSuperGroupId} assigned to email ${email}`
      );
      if (!documentsByEmail.has(email))
        documentsByEmail.set(email, { expenses: [], invoices: [] });
      documentsByEmail.get(email)!.expenses.push(expense);
    }

    for (const invoice of invoices) {
      const email = getEmail(invoice.gammaSuperGroupId);
      if (!documentsByEmail.has(email))
        documentsByEmail.set(email, { expenses: [], invoices: [] });
      documentsByEmail.get(email)!.invoices.push(invoice);
    }

    for (const [
      email,
      { expenses: groupExpenses, invoices: groupInvoices }
    ] of documentsByEmail) {
      let message = 'You have new documents to review:\n\n';
      if (groupExpenses.length > 0) {
        message += `${groupExpenses.length} expense${
          groupExpenses.length === 1 ? '' : 's'
        }:\n`;
        message +=
          groupExpenses
            .map(
              (e) =>
                ` - ${e.name}: ${process.env.BASE_URL}/org/${e.organizationId}/expenses/view?id=${e.id}`
            )
            .join('\n') + '\n';
      }
      if (groupInvoices.length > 0) {
        message += `${groupInvoices.length} invoice${
          groupInvoices.length === 1 ? '' : 's'
        }:\n`;
        message += groupInvoices
          .map(
            (i) =>
              ` - ${i.name}: ${process.env.BASE_URL}/org/${i.organizationId}/invoices/view?id=${i.id}`
          )
          .join('\n');
      }

      await GotifyService.sendMessage(
        email,
        'noreply.cashit@chalmers.it',
        'New documents to review',
        message
      );
    }
  }
}
