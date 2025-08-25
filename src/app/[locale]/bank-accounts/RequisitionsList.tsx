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
  locale
}: {
  requisitions: Awaited<
    ReturnType<typeof GoCardlessService.getRegisteredRequisitionsWithStatus>
  >;
  groups: Awaited<ReturnType<typeof GammaService.getAllSuperGroups>>;
  locale: string;
}) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CR':
        return 'Created';
      case 'GC':
        return 'Giving Consent';
      case 'UA':
        return 'Undergoing Authentication';
      case 'RJ':
        return 'Rejected';
      case 'SA':
        return 'Selecting Accounts';
      case 'GA':
        return 'Granting Access';
      case 'LN':
        return 'Linked';
      case 'EX':
        return 'Expired';
      default:
        return 'Unknown';
    }
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
          Bank Account Connections
        </Heading>
        <Link href="/bank-accounts/connect">
          <Button colorPalette="cyan">
            <HiPlus />
            Add bank connection
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
            No bank connections found
          </Text>
          <Text color="fg.muted" mb={4}>
            Connect your first bank account to get started with managing your
            finances.
          </Text>
          <Link href="/bank-accounts/connect">
            <Button colorPalette="blue">
              <HiPlus />
              Connect First Bank Account
            </Button>
          </Link>
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
                      <Heading size="md">Connection #{requisition.id}</Heading>
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
                          href={
                            '/bank-accounts/reconnect?requisition=' +
                            requisition.goCardlessId
                          }
                        >
                          <Button size="sm" colorPalette="orange">
                            <HiLink />
                            Reconnect
                          </Button>
                        </Link>
                      )}
                      <Link
                        href={
                          '/bank-accounts/add-account?requisition=' +
                          requisition.goCardlessId
                        }
                      >
                        <Button size="sm" variant="outline">
                          <HiPlus />
                          Add Account
                        </Button>
                      </Link>
                      <DeleteRequisitionButton
                        requisitionId={requisition.goCardlessId}
                        accountCount={requisition.bankAccounts.length}
                      />
                    </HStack>
                  </HStack>

                  {/* Requisition totals */}
                  <Box p={3} bg="bg.muted" rounded="md">
                    <HStack gap={6}>
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" color="fg.muted">
                          Available in connection
                        </Text>
                        <Text fontWeight="semibold" color="green.600">
                          {i18nService.formatNumber(totalAvailable)}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                          Booked: {i18nService.formatNumber(totalBooked)}
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
                                  href={`/bank-accounts/view?id=${account.goCardlessId}`}
                                >
                                  {account.name}
                                </Link>
                              </Text>
                              <Text fontSize="sm" color="fg.muted">
                                Refreshed{' '}
                                {i18nService.formatRelative(
                                  account.updatedAt,
                                  'en'
                                )}
                              </Text>
                              <Text fontSize="sm" color="fg.muted">
                                {account.gammaSuperGroupAccesses.length > 0 ? (
                                  <>
                                    {account.gammaSuperGroupAccesses.length}{' '}
                                    group
                                    {account.gammaSuperGroupAccesses.length !==
                                    1
                                      ? 's'
                                      : ''}
                                  </>
                                ) : (
                                  'No permissions'
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
                                  Booked:{' '}
                                  {new Intl.NumberFormat('sv-SE').format(
                                    account.balanceBooked
                                  )}
                                </Text>
                              </Text>
                              <HStack gap={0.5}>
                                <RefreshAccountButton accountId={account.id} />
                                <Link
                                  href={`/bank-accounts/settings?account=${account.goCardlessId}`}
                                >
                                  <IconButton size="sm" variant="ghost">
                                    <HiCog />
                                  </IconButton>
                                </Link>
                                <DeleteAccountButton
                                  goCardlessId={account.goCardlessId}
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
                        No bank accounts found in this connection
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
