import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack
} from '@chakra-ui/react';
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
  const localRequisitions = await GoCardlessService.getRegisteredRequisitions();
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
          <Heading size="md" mb={3}>
            Total Balances
          </Heading>
          <HStack gap={8}>
            <VStack align="start" gap={1}>
              <Text fontSize="sm" color="fg.muted">
                Available Balance
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {new Intl.NumberFormat('sv-SE').format(totalAvailable)}
              </Text>
            </VStack>
            <VStack align="start" gap={1}>
              <Text fontSize="sm" color="fg.muted">
                Booked Balance
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {new Intl.NumberFormat('sv-SE').format(totalBooked)}
              </Text>
            </VStack>
            <VStack align="start" gap={1}>
              <Text fontSize="sm" color="fg.muted">
                Total Accounts
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {accounts.length}
              </Text>
            </VStack>
          </HStack>
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
