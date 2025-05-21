import i18nService from '@/services/i18nService';
import SessionService from '@/services/sessionService';
import { Badge, Box, Flex, Heading, Separator, Text } from '@chakra-ui/react';
import Link from 'next/link';
import './page.css';
import ExpenseService from '@/services/expenseService';
import InvoiceService from '@/services/invoiceService';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
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
    <>
      <Heading as="h1" size="xl">
        Welcome to CashIT!
      </Heading>
      <Text>
        This service is in beta and is subject to change. Please report any bugs
        or issues to Goose or on{' '}
        <Link href="https://github.com/cthit/CashIT/issues">GitHub</Link>.
        Please see the menu on the left for navigation.
      </Text>
      {(bankAccounts.length > 0 || divisionTreasurer) && (
        <>
          <Box>
            <Heading as="h1" size="xl" display="inline" mr="auto">
              {l.home.statistics}
            </Heading>
            <Text color="fg.muted" textStyle="sm">
              {l.home.statisticsDescription}
            </Text>
          </Box>
          <Box p="1" />

          <Flex as="ul" gap="1rem" justifyContent="start" flexWrap="wrap">
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
                  borderWidth="1px"
                  borderRadius="md"
                  minW="15rem"
                  maxW="20rem"
                  height="max-content"
                >
                  <Link href="/expenses">
                    <Flex
                      justifyContent="space-between"
                      alignItems="center"
                      p="2"
                      _hover={{ bg: 'bg.subtle' }}
                      roundedTop="md"
                    >
                      <Box>
                        <Heading as="h1" size="xl" display="inline" mr="auto">
                          {l.categories.expenses}
                        </Heading>
                        <Text>
                          <Badge
                            size="sm"
                            colorPalette={unpaid.length > 0 ? 'yellow' : 'gray'}
                          >
                            {unpaid.length}{' '}
                            {unpaid.length === 1
                              ? l.economy.unpaid
                              : l.economy.unpaidPlural}
                          </Badge>
                        </Text>
                      </Box>
                      <MdOutlineArrowForwardIos />
                    </Flex>
                  </Link>
                  <Separator />
                  <Box p="2">
                    <Flex justifyContent="space-between">
                      <Text>{l.economy.total}</Text>
                      <Text>
                        {i18nService.formatNumber(
                          unpaid.reduce((a, b) => a + b.amount, 0)
                        )}
                      </Text>
                    </Flex>
                  </Box>
                </Box>
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  minW="15rem"
                  maxW="20rem"
                  height="max-content"
                >
                  <Link href="/invoices">
                    <Flex
                      justifyContent="space-between"
                      alignItems="center"
                      p="2"
                      _hover={{ bg: 'bg.subtle' }}
                      roundedTop="md"
                    >
                      <Box>
                        <Heading as="h1" size="xl" display="inline" mr="auto">
                          {l.categories.invoices}
                        </Heading>
                        <Text>
                          <Badge
                            size="sm"
                            colorPalette={unsent.length > 0 ? 'yellow' : 'gray'}
                          >
                            {unsent.length}{' '}
                            {unsent.length === 1
                              ? l.economy.unpaid
                              : l.economy.unpaidPlural}
                          </Badge>
                        </Text>
                      </Box>
                      <MdOutlineArrowForwardIos />
                    </Flex>
                  </Link>
                  <Separator />
                  <Box p="2">
                    <Flex justifyContent="space-between">
                      <Text>{l.economy.total}</Text>
                      <Text>
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
          </Flex>
        </>
      )}
    </>
  );
}
