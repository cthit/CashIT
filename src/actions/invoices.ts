'use server';

import InvoiceService from '@/services/invoiceService';
import SessionService from '@/services/sessionService';
import { Prisma, RequestStatus } from '@prisma/client';

export async function getInvoicesForGroup(gammaSuperGroupId: string) {
  if (!SessionService.canEditGroup(gammaSuperGroupId)) {
    throw new Error(
      'User does not have permission to view invoices for this group'
    );
  }
  return InvoiceService.getForGroup(gammaSuperGroupId);
}

export async function createInvoiceForGroup(
  gammaGroupId: string,
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
  const gammaUserId = (await SessionService.getUser())?.id;
  if (!gammaUserId) {
    throw new Error('User is not logged in and cannot create an invoice');
  }

  const group = (await SessionService.getGroups()).find(
    (g) => g.group.id === gammaGroupId
  )?.group;
  if (group === undefined) {
    throw new Error('Group does not exist');
  }

  return InvoiceService.createForGroup(
    group.superGroup.id,
    gammaGroupId,
    gammaUserId,
    name,
    customerName,
    description,
    items,
    deliveryDate,
    customerReference,
    customerReferenceCode,
    customerSubscriptionNumber,
    customerOrderReference,
    customerContractNumber
  );
}

export async function editInvoiceForGroup(
  id: number,
  gammaGroupId: string,
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
  const gammaUserId = (await SessionService.getUser())?.id;
  if (!gammaUserId) {
    throw new Error('User is not logged in and cannot create an invoice');
  }

  const existing = await InvoiceService.getById(id);
  if (existing === null) {
    throw new Error('Invoice does not exist');
  } else if (existing.gammaSuperGroupId === null) {
    throw new Error('Invoice is not a group invoice');
  } else if (existing.gammaGroupId !== gammaGroupId) {
    throw new Error('Group does not own this invoice');
  }

  if (existing.sentAt !== null || existing.status === RequestStatus.APPROVED) {
    throw new Error(
      'Expense cannot be edited after it has been paid or approved'
    );
  }

  const group = (await SessionService.getGroups()).find(
    (g) => g.group.id === gammaGroupId
  )?.group;
  if (group === undefined) {
    throw new Error('Group does not exist');
  }

  return InvoiceService.editForGroup(
    id,
    group.superGroup.id,
    gammaGroupId,
    gammaUserId,
    name,
    customerName,
    description,
    items,
    deliveryDate,
    customerReference,
    customerReferenceCode,
    customerSubscriptionNumber,
    customerOrderReference,
    customerContractNumber
  );
}

export async function createPersonalInvoice(
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
  const gammaUserId = (await SessionService.getUser())?.id;
  if (!gammaUserId) {
    throw new Error('User is not logged in and cannot create an invoice');
  }

  return InvoiceService.createPersonal(
    gammaUserId,
    name,
    customerName,
    description,
    items,
    deliveryDate,
    customerReference,
    customerReferenceCode,
    customerSubscriptionNumber,
    customerOrderReference,
    customerContractNumber
  );
}

export async function editPersonalInvoice(
  id: number,
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
  const gammaUserId = (await SessionService.getUser())?.id;
  if (!gammaUserId) {
    throw new Error('User is not logged in and cannot create an invoice');
  }

  const existing = await InvoiceService.getById(id);

  if (existing === null) {
    throw new Error('Invoice does not exist');
  } else if (
    existing.gammaSuperGroupId !== null ||
    existing.gammaGroupId !== null
  ) {
    throw new Error('Invoice is not a personal invoice');
  } else if (existing.gammaUserId !== gammaUserId) {
    throw new Error('User does not own this invoice');
  }

  if (existing.sentAt !== null || existing.status === RequestStatus.APPROVED) {
    throw new Error(
      'Expense cannot be edited after it has been paid or approved'
    );
  }

  return InvoiceService.editPersonal(
    id,
    gammaUserId,
    name,
    customerName,
    description,
    items,
    deliveryDate,
    customerReference,
    customerReferenceCode,
    customerSubscriptionNumber,
    customerOrderReference,
    customerContractNumber
  );
}

export async function markInvoiceAsSent(expenseId: number) {
  return InvoiceService.markAsSent(expenseId);
}

export async function markInvoiceAsNotSent(expenseId: number) {
  return InvoiceService.markAsNotSent(expenseId);
}

export async function deleteInvoice(expenseId: number) {
  return InvoiceService.delete(expenseId);
}

export async function requestInvoiceRevision(expenseId: number) {
  return InvoiceService.requestRevision(expenseId);
}

export async function approveInvoice(expenseId: number) {
  return InvoiceService.approve(expenseId);
}
