'use server';

import SessionService from '@/services/sessionService';
import UserService from '@/services/userService';

export async function editOwnForwardEmail(email: string | null) {
  const user = await SessionService.getUser();
  if (!user) {
    throw new Error('User not found');
  }

  return await UserService.editEmail(user.id, email);
}
