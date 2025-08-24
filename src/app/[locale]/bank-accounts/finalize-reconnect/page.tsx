import { Box, Heading } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import SessionService from '@/services/sessionService';
import { notFound } from 'next/navigation';
import GoCardlessService from '@/services/goCardlessService';
import { getExistingBankAccounts } from '@/actions/bankAccounts';
import { registerRequisition } from '@/actions/goCardless';
import prisma from '@/prisma';
import BankAccountManager from '@/components/BankAccountManager/BankAccountManager';

export default async function Page(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!divisionTreasurer) {
    notFound();
  }
  const ref = (await props.searchParams).ref;
  if (!ref) {
    notFound();
  }

  const requisitions = (await GoCardlessService.getRequisitions()).results;
  const requisition = requisitions.find((r) => r.reference === ref);
  if (!requisition) {
    notFound();
  }

  // Check if requisition is already registered, if not register it
  let localRequisition = await prisma.goCardlessRequisition.findUnique({
    where: { goCardlessId: requisition.id }
  });

  if (!localRequisition) {
    await registerRequisition(requisition.id);
    localRequisition = await prisma.goCardlessRequisition.findUnique({
      where: { goCardlessId: requisition.id }
    });
  }

  if (!localRequisition) {
    throw new Error('Failed to register requisition');
  }

  const existingAccounts = await getExistingBankAccounts();

  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href="/bank-accounts">
          {l.bankAccounts.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>Finalize Reconnection</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />

      <Heading as="h1" size="xl" mb="6">
        Finalize Reconnection
      </Heading>

      <BankAccountManager
        mode="reconnect"
        accounts={requisition.accounts}
        requisitionId={requisition.id}
        existingAccounts={existingAccounts}
      />
    </>
  );
}
