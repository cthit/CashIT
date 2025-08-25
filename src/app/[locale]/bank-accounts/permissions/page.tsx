import { Box, Heading } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import BankAccountService from '@/services/bankAccountService';
import SessionService from '@/services/sessionService';
import { notFound } from 'next/navigation';
import GammaService from '@/services/gammaService';
import AddPermissionForm from '../AddPermissionForm';

export default async function Page(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ account?: string }>;
}) {
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!divisionTreasurer) {
    notFound();
  }

  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const accounts = await BankAccountService.getAll();
  const groups = await GammaService.getAllSuperGroups();

  const { account: selectedAccountId } = await props.searchParams;

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href="/bank-accounts">
          {l.bankAccounts.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>Manage Permissions</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />

      <Heading as="h1" size="xl" mb="6">
        Manage Bank Account Permissions
      </Heading>

      <AddPermissionForm 
        accounts={accounts} 
        groups={groups}
        selectedAccountId={selectedAccountId}
      />
    </>
  );
}
