'use server';

import ExpenseService from '@/services/expenseService';
import { MediaType } from '@/services/fileService';
import GotifyService, { GotifyAttachment } from '@/services/gotifyService';
import i18nService from '@/services/i18nService';
import MediaService from '@/services/mediaService';
import SessionService from '@/services/sessionService';
import UserService from '@/services/userService';
import { ExpenseType, RequestStatus } from '@prisma/client';

export async function getExpensesForGroup(gammaSuperGroupId: string) {
  if (!SessionService.canEditGroup(gammaSuperGroupId)) {
    throw new Error(
      'User does not have permission to view expenses for this group'
    );
  }
  return ExpenseService.getForGroup(gammaSuperGroupId);
}

export async function createExpenseForGroup(
  gammaGroupId: string,
  orgId: number,
  amount: number,
  name: string,
  description: string,
  date: Date,
  files: FormData,
  type: ExpenseType
) {
  const gammaUserId = (await SessionService.getUser())?.id;
  if (!gammaUserId) {
    throw new Error('User is not logged in and cannot create an expense');
  }

  const group = (await SessionService.getGroups()).find(
    (g) => g.group.id === gammaGroupId
  )?.group;
  if (group === undefined) {
    throw new Error('Group does not exist');
  }

  const receipts = (
    await Promise.all(
      Array.from(files.getAll('file') as unknown as File[]).map(
        async (file) => {
          return await MediaService.saveNamed(
            file,
            file.name,
            Object.values(MediaType)
          );
        }
      )
    )
  )
    .filter((r) => r !== null)
    .map((r) => r.id);

  if (receipts.length === 0) {
    throw new Error('No files were uploaded');
  }

  return ExpenseService.createForGroup(
    group.superGroup.id,
    gammaGroupId,
    gammaUserId,
    orgId,
    amount,
    name,
    description,
    date,
    receipts,
    type
  );
}

export async function editExpense(
  id: number,
  gammaGroupId: string | null,
  amount: number,
  name: string,
  description: string,
  date: Date,
  files: FormData,
  uploadedFiles: number[],
  type: ExpenseType
) {
  const gammaUserId = (await SessionService.getUser())?.id;
  if (!gammaUserId) {
    throw new Error('User is not logged in and cannot edit an expense');
  }

  const existing = await ExpenseService.getById(id);

  if (existing === null) {
    throw new Error('Expense does not exist');
  }

  // Check if user has permission to edit this expense
  // User can edit if:
  // 1. They created the expense (for personal expenses)
  // 2. They belong to the group that owns the expense (for group expenses)
  const userGroups = await SessionService.getGroups();
  const canEdit =
    existing.gammaUserId === gammaUserId || // User created it
    (existing.gammaGroupId !== null &&
      userGroups.some((g) => g.group.id === existing.gammaGroupId)); // User belongs to the group

  if (!canEdit) {
    throw new Error('User does not have permission to edit this expense');
  }

  if (existing.paidAt !== null || existing.status === RequestStatus.APPROVED) {
    throw new Error(
      'Expense cannot be edited after it has been paid or approved'
    );
  }

  // Validate the new group if specified
  let group = null;
  if (gammaGroupId !== null) {
    group = userGroups.find((g) => g.group.id === gammaGroupId)?.group;
    if (group === undefined) {
      throw new Error('Group does not exist or user does not have access to it');
    }
  }

  const receipts = (
    await Promise.all(
      Array.from(files.getAll('file') as unknown as File[]).map(
        async (file) => {
          return await MediaService.saveNamed(
            file,
            file.name,
            Object.values(MediaType)
          );
        }
      )
    )
  )
    .filter((r) => r !== null)
    .map((r) => r.id);

  if (receipts.concat(uploadedFiles).length === 0) {
    throw new Error('No files were uploaded');
  }

  // Update as group expense or personal expense based on gammaGroupId
  if (gammaGroupId !== null && group !== null) {
    return ExpenseService.editForGroup(
      id,
      group.superGroup.id,
      gammaGroupId,
      gammaUserId,
      amount,
      name,
      description,
      date,
      receipts.concat(uploadedFiles),
      type
    );
  } else {
    return ExpenseService.editPersonal(
      id,
      gammaUserId,
      amount,
      name,
      description,
      receipts.concat(uploadedFiles),
      type
    );
  }
}

export async function createPersonalExpense(
  orgId: number,
  amount: number,
  name: string,
  description: string,
  date: Date,
  files: FormData,
  type: ExpenseType
) {
  const gammaUserId = (await SessionService.getUser())?.id;
  if (!gammaUserId) {
    throw new Error('User is not logged in and cannot create an expense');
  }

  const receipts = (
    await Promise.all(
      Array.from(files.getAll('file') as unknown as File[]).map(
        async (file) => {
          return await MediaService.saveNamed(
            file,
            file.name,
            Object.values(MediaType)
          );
        }
      )
    )
  )
    .filter((r) => r !== null)
    .map((r) => r.id);

  if (receipts.length === 0) {
    throw new Error('No files were uploaded');
  }

  return ExpenseService.createPersonal(
    gammaUserId,
    orgId,
    amount,
    name,
    description,
    date,
    receipts,
    type
  );
}

export async function markExpenseAsPaid(expenseId: number) {
  const existing = await ExpenseService.getById(expenseId);

  if (existing === null) {
    throw new Error('Expense does not exist');
  }

  return ExpenseService.markAsPaid(expenseId);
}

export async function markExpenseAsUnpaid(expenseId: number) {
  const existing = await ExpenseService.getById(expenseId);

  if (existing === null) {
    throw new Error('Expense does not exist');
  }

  return ExpenseService.markAsUnpaid(expenseId);
}

export async function deleteExpense(expenseId: number) {
  const existing = await ExpenseService.getById(expenseId);

  if (existing === null) {
    throw new Error('Expense does not exist');
  }

  return ExpenseService.delete(expenseId);
}

export async function requestExpenseRevision(expenseId: number) {
  const existing = await ExpenseService.getById(expenseId);

  if (existing === null) {
    throw new Error('Expense does not exist');
  }

  return ExpenseService.requestRevision(expenseId);
}

export async function approveExpense(expenseId: number) {
  const existing = await ExpenseService.getById(expenseId);

  if (existing === null) {
    throw new Error('Expense does not exist');
  }

  return ExpenseService.approve(expenseId);
}

export async function forwardExpenseToEmail(expenseId: number, email?: string) {
  const user = await SessionService.getUser();
  if (user === undefined) {
    throw new Error('User is not logged in and cannot forward an expense');
  }

  const existing = await ExpenseService.getById(expenseId);

  if (existing === null) {
    throw new Error('Expense does not exist');
  }

  const userDb =
    email === undefined ? await UserService.getById(user.id) : undefined;
  const recipient = email ?? userDb?.forwardEmail;
  if (recipient === undefined || recipient === null) {
    throw new Error('No recipient email address provided');
  }

  const attachments = [] as GotifyAttachment[];
  for (const r of existing.receipts) {
    const m = await MediaService.load(r.media.sha256);
    if (m === null) continue;
    const data = m.data.toString('base64');
    attachments.push({
      name: r.name,
      content_type: r.media.extension,
      data
    });
  }

  await GotifyService.sendMessage(
    recipient,
    'noreply.cashit@chalmers.it',
    'Forwarded expense',
    `You have been forwarded an expense.\n\nName: ${
      existing.name
    }\nDescription: ${existing.description}\nAmount: ${
      existing.amount
    } kr\nCreation date: ${i18nService.formatDate(
      existing.occurredAt
    )}\nType: ${
      existing.type
    }\nReceipts: See included email attachments.\n\nYou can view it at ${
      process.env.NEXT_PUBLIC_ROOT_URL
    }/expenses/view?id=${expenseId}.`,
    attachments
  );
}
