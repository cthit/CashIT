import { Box, Heading, Text } from '@chakra-ui/react';
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
import SessionService from '@/services/sessionService';
import { notFound } from 'next/navigation';
import GoCardlessService from '@/services/goCardlessService';
import AddAccountForm from './AddAccountForm';
import AddPermissionForm from './AddPermissionForm';
import AddRequisitionForm from './AddRequisitionForm';
import GammaService from '@/services/gammaService';

export default async function Page(props: {
  params: Promise<{ locale: string }>;
}) {
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!divisionTreasurer) {
    notFound();
  }

  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const accounts = await BankAccountService.getAll();

  const localRequisitions = await GoCardlessService.getRegisteredRequisitions();
  const requisitions = (await GoCardlessService.getRequisitions()).results;
  const unusedRequisitions = requisitions.filter(
    (r) => !localRequisitions.find((lr) => lr.goCardlessId === r.id)
  );
  const usedRequisitions = requisitions.filter((r) =>
    localRequisitions.find((lr) => lr.goCardlessId === r.id)
  );

  const groups = await GammaService.getAllSuperGroups();

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
      <Box p="2" />
      <UpdateAccountsButton locale={locale} />
      <Box p="2" />

      <Heading as="h1" size="xl" display="inline" mr="auto">
        Accounts
      </Heading>
      {accounts.length > 0 && (
        <ul>
          {accounts.map((account) => (
            <li key={account.id}>{account.name}</li>
          ))}
        </ul>
      )}
      {accounts.length === 0 && <Text>No accounts found</Text>}
      {localRequisitions.length > 0 && (
        <AddAccountForm requisitions={usedRequisitions} accounts={accounts} />
      )}
      <Box p="2" />

      <Heading as="h1" size="xl" display="inline" mr="auto">
        Account Permissions
      </Heading>
      {accounts.length > 0 && (
        <ul>
          {accounts.map(
            (a) =>
              a.gammaSuperGroupAccesses.length > 0 && (
                <li key={a.id}>
                  <Heading size="sm">{a.name}</Heading>
                  <ul>
                    {a.gammaSuperGroupAccesses.map((b) => (
                      <li key={b}>
                        <Text color="subtle" fontSize="sm">
                          {b}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </li>
              )
          )}
        </ul>
      )}
      {accounts.length === 0 && <Text>No accesses found</Text>}
      {accounts.length > 0 && (
        <>
          <Box p="2" />
          <AddPermissionForm groups={groups} accounts={accounts} />
        </>
      )}
      <Box p="2" />

      <Heading as="h1" size="xl" display="inline" mr="auto">
        GoCardless Requisitions
      </Heading>
      {localRequisitions.length > 0 && (
        <ul>
          {localRequisitions.map((req) => (
            <li key={req.id}>{req.goCardlessId}</li>
          ))}
        </ul>
      )}
      {localRequisitions.length === 0 && <Text>No requisitions found</Text>}
      <Box p="2" />
      <AddRequisitionForm requisitions={unusedRequisitions} />
    </>
  );
}
