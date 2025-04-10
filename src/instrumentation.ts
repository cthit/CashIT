import schedule from 'node-schedule';
import BankAccountService from './services/bankAccountService';
import MailNotificationService from './services/mailNotificationService';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('Scheduling tasks');

    schedule.scheduleJob(
      '0 16 * * *',
      MailNotificationService.notifyNewDocuments
    );
    schedule.scheduleJob('0 */8 * * *', BankAccountService.refreshAll);
  }
}
