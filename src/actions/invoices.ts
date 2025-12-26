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
  orgId: number,
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
    orgId,
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

export async function editInvoice(
  id: number,
  gammaGroupId: string | null,
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
    throw new Error('User is not logged in and cannot edit an invoice');
  }

  const existing = await InvoiceService.getById(id);
  if (existing === null) {
    throw new Error('Invoice does not exist');
  }

  // Check if user has permission to edit this invoice
  // User can edit if:
  // 1. They created the invoice (for personal invoices)
  // 2. They belong to the group that owns the invoice (for group invoices)
  const userGroups = await SessionService.getGroups();
  const canEdit =
    existing.gammaUserId === gammaUserId || // User created it
    (existing.gammaGroupId !== null &&
      userGroups.some((g) => g.group.id === existing.gammaGroupId)); // User belongs to the group

  if (!canEdit) {
    throw new Error('User does not have permission to edit this invoice');
  }

  if (existing.sentAt !== null || existing.status === RequestStatus.APPROVED) {
    throw new Error(
      'Invoice cannot be edited after it has been sent or approved'
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

  // Update as group invoice or personal invoice based on gammaGroupId
  if (gammaGroupId !== null && group !== null) {
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
  } else {
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
}

export async function createPersonalInvoice(
  orgId: number,
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
    orgId,
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
