import i18nService from '@/services/i18nService';
import { Box, Flex, Heading, Separator, Text } from '@chakra-ui/react';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { MdOutlineArrowForwardIos } from 'react-icons/md';

export default function BankAccountsCard({
  accounts,
  locale,
  linkToControls
}: {
  accounts: Prisma.BankAccountGetPayload<{}>[];
  locale: string;
  linkToControls?: boolean;
}) {
  const l = i18nService.getLocale(locale);

  const title = (
    <>
      <Heading>{l.bankAccounts.title}</Heading>
      {accounts.length > 0 && (
        <Text textStyle="sm" color="fg.muted">
          {l.bankAccounts.updated}{' '}
          {i18nService.formatDate(accounts[0]?.refreshedAt)}
        </Text>
      )}
    </>
  );

  return (
    <Box
      minW="14rem"
      maxW="20rem"
      borderWidth="1px"
      rounded="md"
      height="max-content"
    >
      {linkToControls ? (
        <Link href="/bank-accounts">
          <Flex
            _hover={{ bg: linkToControls ? 'bg.subtle' : undefined }}
            justifyContent="space-between"
            alignItems="center"
            p="2"
            roundedTop="md"
          >
            <Box>{title}</Box>
            {linkToControls && <MdOutlineArrowForwardIos />}
          </Flex>
        </Link>
      ) : (
        <Box p="2">{title}</Box>
      )}

      {accounts.length > 0 && (
        <>
          <Separator />
          <Box p="2">
            {accounts.map((a) => (
              <Flex justifyContent="space-between" key={a.id}>
                <Text>{a.name}</Text>
                <Text>{i18nService.formatNumber(a.balanceAvailable)}</Text>
              </Flex>
            ))}
          </Box>
        </>
      )}

      {accounts.length !== 1 && (
        <>
          <Separator />
          <Box p="2">
            <Flex justifyContent="space-between">
              <Text>{l.bankAccounts.liquidityTotal}</Text>
              <Text>
                {i18nService.formatNumber(
                  accounts.reduce((a, b) => a + b.balanceAvailable, 0)
                )}
              </Text>
            </Flex>
          </Box>
        </>
      )}
    </Box>
  );
}
