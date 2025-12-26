import GoCardlessService from '@/services/goCardlessService';
import GammaService from '@/services/gammaService';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Flex,
  IconButton
} from '@chakra-ui/react';
import Link from 'next/link';
import { HiLink, HiPlus, HiCog } from 'react-icons/hi';
import RefreshAccountButton from './RefreshAccountButton';
import DeleteRequisitionButton from './DeleteRequisitionButton';
import i18nService from '@/services/i18nService';
import DeleteAccountButton from './DeleteAccountButton';

const RequisitionsList = ({
  requisitions,
  groups: _groups,
  orgId,
  locale
}: {
  requisitions: Awaited<
    ReturnType<typeof GoCardlessService.getRegisteredRequisitionsWithStatus>
  >;
  groups: Awaited<ReturnType<typeof GammaService.getAllSuperGroups>>;
  orgId: number;
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);
  const getStatusLabel = (status: string) => {
    return (
      l.bankConnections.status[
        status as keyof typeof l.bankConnections.status
      ] || l.bankConnections.status.unknown
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LN':
        return 'green';
      case 'EX':
        return 'red';
      case 'RJ':
        return 'red';
      case 'CR':
      case 'GC':
      case 'UA':
      case 'SA':
      case 'GA':
        return 'blue';
      default:
        return 'gray';
    }
  };
  return (
    <VStack gap={4} align="stretch">
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <Heading as="h1" size="xl">
          {l.bankConnections.title}
        </Heading>
        <Link href={`/org/${orgId}/bank-accounts/connect`}>
          <Button colorPalette="cyan">
            <HiPlus />
            {l.bankConnections.addConnection}
          </Button>
        </Link>
      </Flex>

      {requisitions.length === 0 ? (
        <Box
          p={6}
          bg="bg.subtle"
          rounded="md"
          borderWidth="1px"
          textAlign="center"
        >
          <Text fontSize="lg" mb={2}>
            {l.bankConnections.noConnectionsFound}
          </Text>
          <Text color="fg.muted" mb={4}>
            {l.bankConnections.connectFirstAccount}
          </Text>
        </Box>
      ) : (
        <VStack gap={4} align="stretch">
          {requisitions.map((requisition) => {
            const totalAvailable = requisition.bankAccounts.reduce(
              (sum, account) => sum + account.balanceAvailable,
              0
            );
            const totalBooked = requisition.bankAccounts.reduce(
              (sum, account) => sum + account.balanceBooked,
              0
            );

            return (
              <Box
                key={requisition.id}
                borderWidth="1px"
                rounded="md"
                p={4}
                bg="bg.subtle"
              >
                <VStack gap={4} align="stretch">
                  {/* Requisition header */}
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap={1}>
                      <Heading size="md">
                        {l.bankConnections.connectionNo} #{requisition.id}
                      </Heading>
                      <Text fontSize="sm" color="fg.muted">
                        <Badge
                          colorPalette={getStatusColor(requisition.status)}
                          size="sm"
                        >
                          {getStatusLabel(requisition.status)}
                        </Badge>
                      </Text>
                    </VStack>
                    <HStack>
                      {requisition.status === 'EX' && (
                        <Link
                          href={`/org/${orgId}/bank-accounts/reconnect?requisition=${requisition.goCardlessId}`}
                        >
                          <Button size="sm" colorPalette="orange">
                            <HiLink />
                            {l.bankConnections.reconnect}
                          </Button>
                        </Link>
                      )}
                      <Link
                        href={`/org/${orgId}/bank-accounts/add-account?requisition=${requisition.goCardlessId}`}
                      >
                        <Button size="sm" variant="outline">
                          <HiPlus />
                          {l.bankConnections.addAccount}
                        </Button>
                      </Link>
                      <DeleteRequisitionButton
                        requisitionId={requisition.goCardlessId}
                        accountCount={requisition.bankAccounts.length}
                        locale={locale}
                      />
                    </HStack>
                  </HStack>

                  {/* Requisition totals */}
                  <Box p={3} bg="bg.muted" rounded="md">
                    <HStack gap={6}>
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" color="fg.muted">
                          {l.bankConnections.availableInConnection}
                        </Text>
                        <Text fontWeight="semibold" color="green.600">
                          {i18nService.formatNumber(totalAvailable)}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                          {l.bankConnections.booked}:{' '}
                          {i18nService.formatNumber(totalBooked)}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Bank accounts */}
                  {requisition.bankAccounts.length > 0 ? (
                    <VStack gap={2} align="stretch">
                      {requisition.bankAccounts.map((account) => (
                        <Box
                          key={account.id}
                          borderWidth="1px"
                          rounded="md"
                          p={3}
                          bg="bg.default"
                        >
                          <HStack justify="space-between" align="start">
                            <VStack align="start" flex="1" gap={0}>
                              <Text fontSize="lg" fontWeight="semibold" mb={1}>
                                <Link
                                  href={`/org/${orgId}/bank-accounts/view?id=${account.goCardlessId}`}
                                >
                                  {account.name}
                                </Link>
                              </Text>
                              <Text fontSize="sm" color="fg.muted">
                                {l.bankConnections.refreshed}{' '}
                                {i18nService.formatRelative(
                                  account.updatedAt,
                                  'en'
                                )}
                              </Text>
                              <Text fontSize="sm" color="fg.muted">
                                {account.gammaSuperGroupAccesses.length > 0 ? (
                                  <>
                                    {account.gammaSuperGroupAccesses.length}{' '}
                                    {account.gammaSuperGroupAccesses.length ===
                                    1
                                      ? l.bankConnections.groupSingular
                                      : l.bankConnections.groupPlural}
                                  </>
                                ) : (
                                  l.bankAccounts.noPermissions
                                )}
                              </Text>
                            </VStack>

                            {/* Balance information */}
                            <VStack align="end" gap={1}>
                              <Text fontSize="lg">
                                <Text
                                  as="span"
                                  fontWeight="semibold"
                                  color="green.600"
                                >
                                  {new Intl.NumberFormat('sv-SE').format(
                                    account.balanceAvailable
                                  )}
                                </Text>
                              </Text>
                              <Text fontSize="sm">
                                <Text as="span" color="fg.muted">
                                  {l.bankConnections.booked}:{' '}
                                  {new Intl.NumberFormat('sv-SE').format(
                                    account.balanceBooked
                                  )}
                                </Text>
                              </Text>
                              <HStack gap={0.5}>
                                <RefreshAccountButton accountId={account.id} />
                                <Link
                                  href={`/org/${orgId}/bank-accounts/settings?account=${account.goCardlessId}`}
                                >
                                  <IconButton size="sm" variant="ghost">
                                    <HiCog />
                                  </IconButton>
                                </Link>
                                <DeleteAccountButton
                                  goCardlessId={account.goCardlessId}
                                  locale={locale}
                                />
                              </HStack>
                            </VStack>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Box p={4} bg="bg.muted" rounded="md" textAlign="center">
                      <Text color="fg.muted">
                        {l.bankConnections.noBankAccountsFound}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            );
          })}
        </VStack>
      )}
    </VStack>
  );
};

export default RequisitionsList;
