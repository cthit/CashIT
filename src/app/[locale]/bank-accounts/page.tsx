import { Box } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import UpdateAccountsButton from './UpdateAccountsButton';
import BankAccountsCard from '@/components/BankAccountsCard/BankAccountsCard';
import BankAccountService from '@/services/bankAccountService';

export default async function Page(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const accounts = await BankAccountService.getAll();

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.bankAccounts.title}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <BankAccountsCard accounts={accounts} locale={locale} />
      <Box p="4" />
      <UpdateAccountsButton locale={locale} />
    </>
  );
}
