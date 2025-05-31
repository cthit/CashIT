import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import { EmptyState } from '@/components/ui/empty-state';
import BankAccountService from '@/services/bankAccountService';
import i18nService from '@/services/i18nService';
import SessionService from '@/services/sessionService';
import { Box, Heading, Span, Table, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PiCoins } from 'react-icons/pi';

export default async function Page(props: {
  searchParams: Promise<{ id?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const searchParams = await props.searchParams;
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const { id } = searchParams;
  if (id === undefined) {
    notFound();
  }

  const account = await BankAccountService.getByGoCardlessId(id);
  if (account === null) {
    notFound();
  }

  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  const activeGroups = await SessionService.getActiveGroups();
  if (
    !divisionTreasurer &&
    !account.gammaSuperGroupAccesses.some((id) =>
      activeGroups.some((g) => g.superGroup.id === id)
    )
  ) {
    notFound();
  }

  const refreshWarning =
    new Date().getTime() - account.refreshedAt.getTime() > 1000 * 60 * 60 * 12;

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.bankAccounts.details}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>

      <Box p="4" />

      <Heading as="h1" size="xl" display="inline" mr="auto">
        {l.bankAccounts.accountDetails} {account.name}
      </Heading>
      <Text
        textStyle="sm"
        color="fg.muted"
        title={i18nService.formatDate(account.refreshedAt)}
      >
        {l.bankAccounts.updated}{' '}
        <Span color={refreshWarning ? 'fg.error' : undefined}>
          {i18nService.formatRelative(account.refreshedAt, locale)}
        </Span>
      </Text>

      <Box p="2" />

      <Text>
        {l.bankAccounts.availableBalance}:{' '}
        {i18nService.formatNumber(account.balanceAvailable)}
      </Text>
      <Text>
        {l.bankAccounts.bookedBalance}:{' '}
        {i18nService.formatNumber(account.balanceBooked)}
      </Text>

      <Box p="2" />

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>
              {l.bankAccounts.transactionDate}
            </Table.ColumnHeader>
            <Table.ColumnHeader>{l.bankAccounts.bookDate}</Table.ColumnHeader>
            <Table.ColumnHeader>{l.expense.type}</Table.ColumnHeader>
            <Table.ColumnHeader>{l.general.description}</Table.ColumnHeader>
            <Table.ColumnHeader>{l.expense.status}</Table.ColumnHeader>
            <Table.ColumnHeader>{l.expense.amount}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {account.transactions.map((t) => (
            <Table.Row key={t.id}>
              <Table.Cell>
                {t.valueDate && i18nService.formatDate(t.valueDate, false)}
              </Table.Cell>
              <Table.Cell>
                {t.bookingDate && i18nService.formatDate(t.bookingDate, false)}
              </Table.Cell>
              <Table.Cell>{t.type}</Table.Cell>
              <Table.Cell>{t.reference}</Table.Cell>
              <Table.Cell>
                {t.bookingDate
                  ? l.bankAccounts.transactionBooked
                  : l.bankAccounts.transactionPending}
              </Table.Cell>
              <Table.Cell>{i18nService.formatNumber(t.amount)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        {account.transactions.length === 0 && (
          <Table.Caption>
            <EmptyState
              icon={<PiCoins />}
              title={l.bankAccounts.transactionsEmpty}
              description={l.bankAccounts.transactionsEmptyDesc}
            />
          </Table.Caption>
        )}
      </Table.Root>
    </>
  );
}
