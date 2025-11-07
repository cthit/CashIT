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
import BankAccountService from '@/services/bankAccountService';
import AddAccountForm from './AddAccountForm';

export default async function Page(props: {
  params: Promise<{ locale: string; orgId: string }>;
  searchParams: Promise<{ requisition?: string }>;
}) {
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!divisionTreasurer) {
    notFound();
  }
  const requisitionId = (await props.searchParams).requisition;
  if (!requisitionId) {
    notFound();
  }

  const { locale, orgId } = await props.params;
  const l = i18nService.getLocale(locale);

  const accounts = await BankAccountService.getAll();

  const requisitions = (await GoCardlessService.getRequisitions()).results;
  const requisition = requisitions.find((r) => r.id === requisitionId);
  if (!requisition) {
    notFound();
  }

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
  {/* TODO: Use routing to determine org id dynamically */}
  <BreadcrumbLink  as={Link} href={`/org/${orgId}/bank-accounts`}>
  {l.bankAccounts.title}
  </BreadcrumbLink>
        <BreadcrumbCurrentLink>Add Bank Account</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />

      <Heading as="h1" size="xl" display="inline" mr="auto">
        Add Bank Account
      </Heading>
      <AddAccountForm requisition={requisition} accounts={accounts} />
    </>
  );
}
