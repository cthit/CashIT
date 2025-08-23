import { Box, Heading } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import SessionService from '@/services/sessionService';
import { notFound, redirect } from 'next/navigation';
import GoCardlessService from '@/services/goCardlessService';
import BankAccountConnectManager from './BankAccountConnectManager';

export default async function Page(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; error?: string }>;
}) {
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!divisionTreasurer) {
    notFound();
  }

  const { locale } = await props.params;
  const { ref, error } = await props.searchParams;
  const l = i18nService.getLocale(locale);

  if (error) {
    redirect('/bank-accounts/connect?error=' + encodeURIComponent(error));
  }

  if (!ref) {
    redirect('/bank-accounts/connect?error=' + encodeURIComponent('No reference provided'));
  }

  // Find the requisition by reference
  const allRequisitions = (await GoCardlessService.getRequisitions()).results;
  const requisition = allRequisitions.find((r) => r.reference === ref);

  if (!requisition) {
    redirect('/bank-accounts/connect?error=' + encodeURIComponent('Requisition not found'));
  }

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href="/bank-accounts">
          {l.bankAccounts.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href="/bank-accounts/connect">
          Add Connection
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>Finalize Connection</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />

      <Heading as="h1" size="xl" mb={6}>
        Finalize Bank Connection
      </Heading>

      <BankAccountConnectManager requisition={requisition} />
    </>
  );
}
