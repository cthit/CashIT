'use server';

import MailNotificationService from '@/services/mailNotificationService';
import SessionService from '@/services/sessionService';

export async function sendEmailNotificationsManually() {
  const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!isDivisionTreasurer) {
    throw new Error('User is not a division treasurer');
  }

  await MailNotificationService.notifyNewDocuments();
}
