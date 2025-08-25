import i18nService from '@/services/i18nService';
import SessionService from '@/services/sessionService';
import {
  Badge,
  Box,
  Flex,
  Grid,
  Heading,
  HStack,
  Separator,
  Text,
  VStack
} from '@chakra-ui/react';
import Link from 'next/link';
import './page.css';
import ExpenseService from '@/services/expenseService';
import InvoiceService from '@/services/invoiceService';
import {
  MdOutlineArrowForwardIos,
  MdAccountBalance,
  MdReceiptLong,
  MdAttachMoney
} from 'react-icons/md';
import BankAccountService from '@/services/bankAccountService';
import BankAccountsCard from '@/components/BankAccountsCard/BankAccountsCard';

export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  const unpaid = divisionTreasurer ? await ExpenseService.getUnpaid() : [];
  const unsent = divisionTreasurer ? await InvoiceService.getUnsent() : [];

  const bankAccounts = divisionTreasurer
    ? await BankAccountService.getAll()
    : await SessionService.getBankAccounts();

  return (
    <VStack gap={8} align="stretch" maxW="6xl" mx="auto">
      <Box textAlign="center" py={8}>
        <Heading as="h1" size="2xl" mb={4}>
          Welcome to CashIT!
        </Heading>
        <Text fontSize="sm" color="fg.muted" mt={4}>
          This service is in beta and is subject to change. Please report any
          bugs or issues to Goose or on{' '}
          <Link
            href="https://github.com/cthit/CashIT/issues"
            style={{
              color: 'var(--chakra-colors-blue-500)',
              textDecoration: 'underline'
            }}
          >
            GitHub
          </Link>
          .
        </Text>
      </Box>

      {(bankAccounts.length > 0 || divisionTreasurer) && (
        <VStack gap={6} align="stretch">
          <Box>
            <Heading as="h2" size="xl" mb={2}>
              <HStack gap={2}>
                <MdAccountBalance size={28} />
                <Text>{l.home.statistics}</Text>
              </HStack>
            </Heading>
            <Text color="fg.muted" fontSize="md">
              {l.home.statisticsDescription}
            </Text>
          </Box>

          <Grid
            className="stats-grid"
            templateColumns={{
              base: '1fr',
              md: 'repeat(auto-fit, minmax(300px, 1fr))'
            }}
            gap={6}
          >
            {bankAccounts && (
              <BankAccountsCard
                accounts={bankAccounts}
                locale={locale}
                linkToControls={divisionTreasurer}
              />
            )}

            {divisionTreasurer && (
              <>
                <Box
                  className="stats-card"
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  bg="bg.surface"
                >
                  <Link href="/expenses">
                    <Box p={4} _hover={{ bg: 'bg.subtle' }} cursor="pointer">
                      <Flex justifyContent="space-between" alignItems="center">
                        <VStack align="start" gap={1} height="3rem">
                          <HStack gap={2}>
                            <MdReceiptLong
                              size={20}
                              color="var(--chakra-colors-orange-500)"
                            />
                            <Heading as="h3" size="lg">
                              {l.categories.expenses}
                            </Heading>
                          </HStack>
                          <Badge
                            size="sm"
                            colorPalette={unpaid.length > 0 ? 'orange' : 'gray'}
                            variant={unpaid.length > 0 ? 'solid' : 'subtle'}
                          >
                            {unpaid.length}{' '}
                            {unpaid.length === 1
                              ? l.economy.unpaid
                              : l.economy.unpaidPlural}
                          </Badge>
                        </VStack>
                        <MdOutlineArrowForwardIos
                          size={16}
                          color="var(--chakra-colors-fg-muted)"
                        />
                      </Flex>
                    </Box>
                  </Link>
                  <Separator />
                  <Box p={4}>
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text color="fg.muted" fontWeight="medium">
                        {l.economy.total}
                      </Text>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color={unpaid.length > 0 ? 'orange.500' : 'fg.default'}
                      >
                        {i18nService.formatNumber(
                          unpaid.reduce((a, b) => a + b.amount, 0)
                        )}
                      </Text>
                    </Flex>
                  </Box>
                </Box>

                <Box
                  className="stats-card"
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  bg="bg.surface"
                >
                  <Link href="/invoices">
                    <Box p={4} _hover={{ bg: 'bg.subtle' }} cursor="pointer">
                      <Flex justifyContent="space-between" alignItems="center">
                        <VStack align="start" gap={1} height="3rem">
                          <HStack gap={2}>
                            <MdAttachMoney
                              size={20}
                              color="var(--chakra-colors-green-500)"
                            />
                            <Heading as="h3" size="lg">
                              {l.categories.invoices}
                            </Heading>
                          </HStack>
                          <Badge
                            size="sm"
                            colorPalette={unsent.length > 0 ? 'green' : 'gray'}
                            variant={unsent.length > 0 ? 'solid' : 'subtle'}
                          >
                            {unsent.length}{' '}
                            {unsent.length === 1
                              ? l.economy.unpaid
                              : l.economy.unpaidPlural}
                          </Badge>
                        </VStack>
                        <MdOutlineArrowForwardIos
                          size={16}
                          color="var(--chakra-colors-fg-muted)"
                        />
                      </Flex>
                    </Box>
                  </Link>
                  <Separator />
                  <Box p={4}>
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text color="fg.muted" fontWeight="medium">
                        {l.economy.total}
                      </Text>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color={unsent.length > 0 ? 'green.500' : 'fg.default'}
                      >
                        {i18nService.formatNumber(
                          unsent.reduce(
                            (a, b) =>
                              a + InvoiceService.calculateSumForItems(b.items),
                            0
                          )
                        )}
                      </Text>
                    </Flex>
                  </Box>
                </Box>
              </>
            )}
          </Grid>
        </VStack>
      )}

      {!divisionTreasurer && bankAccounts.length === 0 && (
        <Box textAlign="center" py={16}>
          <Box fontSize="4xl" mb={4}>
            💰
          </Box>
          <Heading as="h2" size="lg" mb={2} color="fg.muted">
            No Financial Data Available
          </Heading>
          <Text color="fg.muted" maxW="md" mx="auto">
            You don&apos;t have access to any bank accounts or financial data
            yet. Contact your division treasurer for access.
          </Text>
        </Box>
      )}
    </VStack>
  );
}
