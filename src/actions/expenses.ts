'use server';

import ExpenseService from '@/services/expenseService';
import { MediaType } from '@/services/fileService';
import MediaService from '@/services/mediaService';
import SessionService from '@/services/sessionService';
import { ExpenseType } from '@prisma/client';

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
    amount,
    name,
    description,
    date,
    receipts,
    type
  );
}

export async function editExpenseForGroup(
  id: number,
  gammaGroupId: string,
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
    throw new Error('User is not logged in and cannot create an expense');
  }

  const group = (await SessionService.getGroups()).find(
    (g) => g.group.id === gammaGroupId
  )?.group;
  if (group === undefined) {
    throw new Error('Group does not exist');
  }

  const existing = await ExpenseService.getById(id);

  if (existing === null) {
    throw new Error('Expense does not exist');
  } else if (
    existing.gammaSuperGroupId === null ||
    existing.gammaGroupId === null
  ) {
    throw new Error('Expense is not a group expense');
  } else if (existing.gammaGroupId !== group.id) {
    throw new Error('Group does not own this expense');
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
}

export async function createPersonalExpense(
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
    amount,
    name,
    description,
    date,
    receipts,
    type
  );
}

export async function editPersonalExpense(
  id: number,
  amount: number,
  name: string,
  description: string,
  files: FormData,
  uploadedFiles: number[],
  type: ExpenseType
) {
  const gammaUserId = (await SessionService.getUser())?.id;
  if (!gammaUserId) {
    throw new Error('User is not logged in and cannot create an expense');
  }

  const existing = await ExpenseService.getById(id);

  if (existing === null) {
    throw new Error('Expense does not exist');
  } else if (
    existing.gammaSuperGroupId !== null ||
    existing.gammaGroupId !== null
  ) {
    throw new Error('Expense is not a personal expense');
  } else if (existing.gammaUserId !== gammaUserId) {
    throw new Error('User does not own this expense');
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
