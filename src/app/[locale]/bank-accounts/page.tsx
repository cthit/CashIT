import { Box, Flex, Heading, Text, VStack, HStack } from '@chakra-ui/react';
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
import GoCardlessService from '@/services/goCardlessService';
import GammaService from '@/services/gammaService';
import RequisitionsList from './RequisitionsList';
import UpdateAccountsButton from './UpdateAccountsButton';

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
  const localRequisitions =
    await GoCardlessService.getRegisteredRequisitionsWithStatus();
  const groups = await GammaService.getAllSuperGroups();

  // Calculate totals
  const totalAvailable = accounts.reduce(
    (sum, account) => sum + account.balanceAvailable,
    0
  );
  const totalBooked = accounts.reduce(
    (sum, account) => sum + account.balanceBooked,
    0
  );

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.bankAccounts.title}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />

      <VStack gap={6} align="stretch">
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Heading as="h1" size="xl">
            {l.bankAccounts.title}
          </Heading>
          <UpdateAccountsButton locale={locale} />
        </Flex>

        <Box p={4} bg="bg.subtle" rounded="md" borderWidth="1px">
          <Heading size="md">Total Available Balance</Heading>
            <VStack align="start" gap={0}>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {new Intl.NumberFormat('sv-SE').format(totalAvailable)}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Booked: {new Intl.NumberFormat('sv-SE').format(totalBooked)}
              </Text>
            </VStack>
        </Box>

        <RequisitionsList
          requisitions={localRequisitions}
          groups={groups}
          locale={locale}
        />
      </VStack>
    </>
  );
}
