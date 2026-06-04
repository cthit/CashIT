import i18nService from '@/services/i18nService';
import {
  Box,
  Flex,
  Heading,
  HStack,
  Separator,
  Span,
  Text
} from '@chakra-ui/react';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import React from 'react';
import { MdAccountBalance, MdOutlineArrowForwardIos } from 'react-icons/md';

export default function BankAccountsCard({
  accounts,
  locale,
  linkToControls,
  orgId = 1
}: {
  accounts: Prisma.BankAccountGetPayload<{}>[];
  locale: string;
  linkToControls?: boolean;
  orgId?: number;
}) {
  const l = i18nService.getLocale(locale);

  const refreshedAt = accounts[0]?.refreshedAt;
  const refreshWarning =
    accounts.length === 0
      ? true
      : new Date().getTime() - refreshedAt.getTime() > 1000 * 60 * 60 * 12;

  const title = (
    <>
      <HStack gap={2}>
        <MdAccountBalance size={20} color="var(--chakra-colors-blue-400)" />
        <Heading as="h3" size="lg">
          {l.bankAccounts.title}
        </Heading>
      </HStack>
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
      maxW="40rem"
      borderWidth="1px"
      rounded="md"
      height="max-content"
    >
      {linkToControls ? (
        <Link href={`/org/${orgId}/bank-accounts`}>
          <Flex
            _hover={{ bg: linkToControls ? 'bg.subtle' : undefined }}
            justifyContent="space-between"
            alignItems="center"
            p={4}
            roundedTop="md"
            minHeight="5rem"
          >
            <Box>{title}</Box>
            {linkToControls && <MdOutlineArrowForwardIos />}
          </Flex>
        </Link>
      ) : (
        <Box p={4} height="15">
          {title}
        </Box>
      )}

      {accounts.length > 0 &&
        accounts.map((a) => (
          <React.Fragment key={a.id}>
            <Separator />
            <Link
              href={`/org/${orgId}/bank-accounts/view?id=${a.goCardlessId}`}
              key={a.id}
            >
              <Flex
                justifyContent="space-between"
                alignItems="center"
                px="4"
                py="1"
              >
                <Text>{a.name}</Text>
                <Box flexGrow="1" />
                <Text mr="3">
                  {i18nService.formatNumber(a.balanceAvailable)}
                </Text>
                <MdOutlineArrowForwardIos />
              </Flex>
            </Link>
          </React.Fragment>
        ))}

      {accounts.length !== 1 && (
        <>
          <Separator />
          <Box p={4}>
            <Flex justifyContent="space-between" alignItems="center">
              <Text color="fg.muted" fontWeight="medium">
                {l.bankAccounts.liquidityTotal}
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="green.600">
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
