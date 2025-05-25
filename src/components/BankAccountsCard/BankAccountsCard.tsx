import i18nService from '@/services/i18nService';
import { Box, Flex, Heading, Separator, Span, Text } from '@chakra-ui/react';
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

  const refreshedAt = accounts[0]?.refreshedAt;
  const refreshWarning =
    accounts.length === 0
      ? true
      : new Date().getTime() - refreshedAt.getTime() > 1000 * 60 * 60 * 12;

  const title = (
    <>
      <Heading>{l.bankAccounts.title}</Heading>
      {accounts.length > 0 && (
        <Text
          textStyle="sm"
          color="fg.muted"
          title={i18nService.formatDate(refreshedAt)}
        >
          {l.bankAccounts.updated}{' '}
          <Span color={refreshWarning ? 'fg.error' : undefined}>
            {i18nService.formatRelative(refreshedAt, locale)}
          </Span>
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
                <Text>
                  <Link href={'/bank-accounts/view?id=' + a.goCardlessId}>
                    {a.name}
                  </Link>
                </Text>
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
