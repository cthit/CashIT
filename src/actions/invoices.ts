'use server';

import InvoiceService from '@/services/invoiceService';
import SessionService from '@/services/sessionService';
import { Prisma, RequestStatus } from '@prisma/client';

export async function getInvoicesForGroup(
  orgId: number,
  gammaSuperGroupId: string
) {
  if (!SessionService.canEditGroup(gammaSuperGroupId)) {
    throw new Error(
      'User does not have permission to view invoices for this group'
    );
  }
  return InvoiceService.getForGroup(orgId, gammaSuperGroupId);
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

  const [divisionTreasurer, localAdmin] = await Promise.all([
    SessionService.isDivisionTreasurer(),
    SessionService.isOrgLocalAdmin(existing.organizationId)
  ]);
  const isAdmin = divisionTreasurer || localAdmin;

  // Check if user has permission to edit this invoice
  const userGroups = await SessionService.getGroups();
  const canEdit =
    isAdmin ||
    existing.gammaUserId === gammaUserId ||
    (existing.gammaGroupId !== null &&
      userGroups.some((g) => g.group.id === existing.gammaGroupId));

  if (!canEdit) {
    throw new Error('User does not have permission to edit this invoice');
  }

  if (!isAdmin && (existing.sentAt !== null || existing.status === RequestStatus.APPROVED)) {
    throw new Error(
      'Invoice cannot be edited after it has been sent or approved'
    );
  }

  // Validate the new group if specified
  // Admins keep the existing group when they don't belong to it
  let group = null;
  if (gammaGroupId !== null) {
    group = userGroups.find((g) => g.group.id === gammaGroupId)?.group ?? null;
    if (group === null && !isAdmin) {
      throw new Error('Group does not exist or user does not have access to it');
    }
    if (group === null && isAdmin) {
      group = existing.gammaGroupId === gammaGroupId
        ? { id: gammaGroupId, superGroup: { id: existing.gammaSuperGroupId! } } as any
        : null;
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

async function assertOrgAdminForInvoice(invoiceId: number) {
  const existing = await InvoiceService.getById(invoiceId);
  if (existing === null) throw new Error('Invoice does not exist');

  const [divisionTreasurer, localAdmin] = await Promise.all([
    SessionService.isDivisionTreasurer(),
    SessionService.isOrgLocalAdmin(existing.organizationId)
  ]);
  if (!divisionTreasurer && !localAdmin) {
    throw new Error('User does not have admin permission for this invoice');
  }
}

export async function markInvoiceAsSent(invoiceId: number) {
  await assertOrgAdminForInvoice(invoiceId);
  return InvoiceService.markAsSent(invoiceId);
}

export async function markInvoiceAsNotSent(invoiceId: number) {
  await assertOrgAdminForInvoice(invoiceId);
  return InvoiceService.markAsNotSent(invoiceId);
}

export async function deleteInvoice(invoiceId: number) {
  await assertOrgAdminForInvoice(invoiceId);
  return InvoiceService.delete(invoiceId);
}

export async function requestInvoiceRevision(invoiceId: number) {
  await assertOrgAdminForInvoice(invoiceId);
  return InvoiceService.requestRevision(invoiceId);
}

export async function approveInvoice(invoiceId: number) {
  await assertOrgAdminForInvoice(invoiceId);
  return InvoiceService.approve(invoiceId);
}
